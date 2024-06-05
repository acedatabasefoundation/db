import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { getMany, getOne, write } from '../../util/storage.js'
import { delete_IdFromRelationshipProp } from './delete_IdFromRelationshipProp.js'
import { delete_IdsFromRelationshipIndex } from './delete_IdsFromRelationshipIndex.js'
import { RELATIONSHIP_PREFIX, getNodeIdsKey, getNodeNamePlusRelationshipNameToNodePropNameMapKey, getRelationshipNameFromProp } from '../../util/variables.js'


/**
 * @param { (string | number)[] } ids
 * @returns { Promise<void> }
 */
export async function deleteNodesById (ids) {
  if (!Array.isArray(ids) || !ids.length) throw AceError('aceFn__deleteNodesById__invalidIds', 'Please ensure calls to deleteNodesById() includes an array of populated ids', { ids })

  /** @type { Map<string | number, td.AceGraphNode> } */
  const graphDeleteNodes = await getMany(ids)

  /** @type { Map<string, Set<string | number>>} Map<relationshipName, ids> Group node ids by node name*/
  const byNode = new Map()

  /** @type { Map<string, Set<string | number>>} Map<relationshipName, _ids> Group relationship _ids by relationship name*/
  const byRelationship = new Map()

  /** @type { Map<string | number, { propName: string, relationshipName: string, cascade: boolean, graphDeleteNodeId: string | number }> } <relationshipId, { propName, relationshipName, cascade }> */
  const relationshipIdsMap = new Map()


  // set byNode, byRelationship & relationshipIdsMap
  for (const [ graphDeleteNodeId, graphDeleteNode ] of graphDeleteNodes) {
    const deleteNodeIds = byNode.get(graphDeleteNode.node) || new Set()
    deleteNodeIds.add(graphDeleteNodeId)
    byNode.set(graphDeleteNode.node, deleteNodeIds)

    for (const howKey in graphDeleteNode) {
      if (howKey.startsWith(RELATIONSHIP_PREFIX)) {
        const relationshipName = getRelationshipNameFromProp(howKey)
        const schemaPropName = Memory.txn.schemaDataStructures.nodeNamePlusRelationshipNameToNodePropNameMap?.get(getNodeNamePlusRelationshipNameToNodePropNameMapKey(graphDeleteNode.node, relationshipName))
        const cascade = schemaPropName ? (Memory.txn.schemaDataStructures.cascade?.get(graphDeleteNode.node)?.has(schemaPropName) || false) : false

        for (const relationshipId of graphDeleteNode[howKey]) {
          const deleteRelationship_Ids = byRelationship.get(relationshipName) || new Set()
          deleteRelationship_Ids.add(relationshipId)
          byRelationship.set(relationshipName, deleteRelationship_Ids)

          relationshipIdsMap.set(relationshipId, { propName: howKey, relationshipName, cascade, graphDeleteNodeId })
        }
      }
    }
  }


  // delete ids from index___nodes___[ nodeName ]
  for (const [ nodeName, deleteNodeIds ] of byNode) {
    const nodeIdsKey = getNodeIdsKey(nodeName)

    /** @type { (string | number)[] } */
    const allNodeIds = await getOne(nodeIdsKey)

    if (Array.isArray(allNodeIds)) {
      for (let i = allNodeIds.length - 1; i >= 0; i--) {
        if (deleteNodeIds.has(allNodeIds[i])) allNodeIds.splice(i, 1)
      }
    }

    if (allNodeIds.length) write('update', nodeIdsKey, allNodeIds)
    else write('delete', nodeIdsKey)
  }


  /** We have nodes to be deleted "graphDeleteNodes" and we have the relationships of those nodes "byRelationship".
   * Each relationship in "byRelationship" is between a node to be deleted and a connecting node.
   * Ensure on the connecting node, the relationship is deleted by puting the connecting nodes in connectingNodes.
   * @type { Map<string | number, string | number> } <nodeId, relationshipId> */
  const connectingNodes = new Map()


  /** We have nodes to be deleted "graphDeleteNodes" and we have the relationships of those nodes "byRelationship".
   * Each relationship in "byRelationship" is between a node to be deleted and a connecting node.
   * If these relationship asks us to cascade delete connecting nodes, add the connecting node to cascadeIds.
   * @type { (string | number)[] } <nodeId, relationshipId> */
  const cascadeIds = []


  // set connectingNodes and cascadeIds
  for (const [ _, deleteRelationship_Ids ] of byRelationship) {
    /** @type { Map<string | number, td.AceGraphRelationship> } */
    const graphRelationships = await getMany([ ...deleteRelationship_Ids ])

    for (const [ relationship_Id, graphRelationship ] of graphRelationships) {
      const details = relationshipIdsMap.get(relationship_Id)

      if (graphRelationship.props.a === details?.graphDeleteNodeId) {
        if (details.cascade) cascadeIds.push(graphRelationship.props.b)
        else connectingNodes.set(graphRelationship.props.b, graphRelationship.props._id)
      }

      if (graphRelationship.props.b === details?.graphDeleteNodeId) {
        if (details.cascade) cascadeIds.push(graphRelationship.props.a)
        else connectingNodes.set(graphRelationship.props.a, graphRelationship.props._id)
      }
    }    
  }


  /** @type { Map<string | number, td.AceGraphNode> } We need the graph node of connecting nodes so that we may remove relationship id's from the graph node */
  const graphConnectingNodes = await getMany([ ...connectingNodes.keys() ])
 
  for (const [ graphConnectingNodeId, graphConnectingNode ] of graphConnectingNodes) {
    const relationship_Id = connectingNodes.get(graphConnectingNodeId)

    if (relationship_Id) {
      const details = relationshipIdsMap.get(relationship_Id)

      if (details) {
        delete_IdFromRelationshipProp(details.propName, relationship_Id, graphConnectingNode)
      }
    }
  }


  // delete relationships from relationship index and delete relationships
  for (const [ relationshipName, deleteRelationship_Ids ] of byRelationship) {
    await delete_IdsFromRelationshipIndex(relationshipName, deleteRelationship_Ids)

    for (const deleteRelationship_Id of deleteRelationship_Ids) {
      write('delete', deleteRelationship_Id)
    }
  }


  // delete requested node ids
  for (const graphDeleteNodeId of ids) {
    write('delete', graphDeleteNodeId)
  }


  // delete ids that are cascade
  if (cascadeIds.length) await deleteNodesById(cascadeIds)
}
