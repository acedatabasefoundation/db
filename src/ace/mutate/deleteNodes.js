import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { getNodeIdsKey } from '../../util/variables.js'
import { write, getOne, getMany } from '../../util/storage.js'
import { delete_IdFromRelationshipProp } from './delete_IdFromRelationshipProp.js'
import { delete_IdsFromRelationshipIndex } from './delete_IdsFromRelationshipIndex.js'


/**
 * @param { (string | number)[] } ids
 * @returns { Promise<void> }
 */
export async function deleteNodes (ids) {
  if (!Array.isArray(ids) || !ids.length) throw new AceError('deleteNodes__invalidIds', 'Please ensure calls to deleteNodes() includes an array of populated ids', { ids })

  const graphDeleteNodes = /** @type { td.AceGraphNode[] } */ (await getMany(ids))
  const byNode = /** @type { Map<string, Set<string | number>>} Map<relationshipName, ids> Group node ids by node name */ (new Map())
  const byRelationship = /** @type { Map<string, Set<string | number>>} Map<relationshipName, _ids> Group relationship _ids by relationship name */ (new Map())
  const relationship_IdsMap = /** @type { Map<string | number, { propName: string, relationshipName: string, cascade: boolean, graphDeleteNodeId: string | number }> } <relationship_Id, { propName, relationshipName, cascade }> */ (new Map())
  const relationshipPropsByNode = /** @type { Map<string, null | Map<string, { node: string, prop: string, relationship: string }>> }  */ (new Map())

  
  for (let i = 0; i < graphDeleteNodes.length; i++) { // set byNode, byRelationship & relationship_IdsMap
    const deleteNodeIds = byNode.get(graphDeleteNodes[i].$aN) || new Set()
    deleteNodeIds.add(graphDeleteNodes[i].$aK)
    byNode.set(graphDeleteNodes[i].$aN, deleteNodeIds)

    let relationshipProps = relationshipPropsByNode.get(graphDeleteNodes[i].$aN)

    if (relationshipProps === undefined) {
      const map = Memory.txn.schemaDataStructures.nodeRelationshipPropsMap.get(graphDeleteNodes[i].$aN)

      if (!map) relationshipPropsByNode.set(graphDeleteNodes[i].$aN, null)
      else relationshipPropsByNode.set(graphDeleteNodes[i].$aN, map)
    }

    if (relationshipProps) {
      for (const entry of relationshipProps) {
        const cascade = /** @type { td.AceSchemaNodeRelationshipOptions } */ (Memory.txn.schema?.nodes[graphDeleteNodes[i].$aN][entry[1].prop].options).cascade || false

        for (let j = 0; j < graphDeleteNodes[i][entry[1].prop].length; j++) {
          const deleteRelationship_Ids = byRelationship.get(entry[1].relationship) || new Set()
          deleteRelationship_Ids.add(graphDeleteNodes[i][entry[1].prop][j])
          byRelationship.set(entry[1].relationship, deleteRelationship_Ids)

          relationship_IdsMap.set(graphDeleteNodes[i][entry[1].prop][j], { propName: entry[1].prop, relationshipName: entry[1].relationship, cascade, graphDeleteNodeId: graphDeleteNodes[i].$aK })
        }
      }
    }
  }


  for (const [ nodeName, deleteNodeIds ] of byNode) { // delete ids from index___nodes___[ nodeName ]
    const nodeIdsKey = getNodeIdsKey(nodeName)
    const allNodeIds = /** @type { td.AceGraphIndex | undefined } */ (await getOne(nodeIdsKey));

    if (Array.isArray(allNodeIds?.index)) {
      for (let i = allNodeIds.index.length - 1; i >= 0; i--) {
        if (deleteNodeIds.has(allNodeIds.index[i])) allNodeIds.index.splice(i, 1)
      }

      if (allNodeIds.index.length) write({ $aA: 'update', $aK: nodeIdsKey, index: allNodeIds.index })
      else write({ $aA: 'delete', $aK: nodeIdsKey })
    }
  }


  /** We have nodes to be deleted "graphDeleteNodes" and we have the relationships of those nodes "byRelationship".
   * Each relationship in "byRelationship" is between a node to be deleted and a connecting node.
   * Ensure on the connecting node, the relationship is deleted by puting the connecting nodes in connectingNodes.
   * @type { Map<string | number, string | number> } <nodeId, relationship_Id> */
  const connectingNodes = new Map()


  /** We have nodes to be deleted "graphDeleteNodes" and we have the relationships of those nodes "byRelationship".
   * Each relationship in "byRelationship" is between a node to be deleted and a connecting node.
   * If these relationship asks us to cascade delete connecting nodes, add the connecting node to cascadeIds.
   * @type { (string | number)[] } <nodeId, relationship_Id> */
  const cascadeIds = []


  for (const [ _, deleteRelationship_Ids ] of byRelationship) { // set connectingNodes and cascadeIds
    const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany([ ...deleteRelationship_Ids ]));

    for (let i = 0; i < graphRelationships.length; i++) {
      const details = relationship_IdsMap.get(graphRelationships[i].$aK)

      if (graphRelationships[i].a === details?.graphDeleteNodeId) {
        if (details.cascade) cascadeIds.push(graphRelationships[i].b)
        else connectingNodes.set(graphRelationships[i].b, graphRelationships[i].$aK)
      }

      if (graphRelationships[i].b === details?.graphDeleteNodeId) {
        if (details.cascade) cascadeIds.push(graphRelationships[i].a)
        else connectingNodes.set(graphRelationships[i].a, graphRelationships[i].$aK)
      }
    }    
  }

  /** We need the graph node of connecting nodes so that we may remove relationship id's from the graph node */
  const graphConnectingNodes = /** @type { td.AceGraphNode[] } */ (await getMany([ ...connectingNodes.keys() ]))
 
  for (const graphConnectingNode of graphConnectingNodes) {
    const relationship_Id = connectingNodes.get(graphConnectingNode.$aK)

    if (relationship_Id) {
      const details = relationship_IdsMap.get(relationship_Id)

      if (details) {
        delete_IdFromRelationshipProp(details.propName, relationship_Id, graphConnectingNode)
      }
    }
  }


  // delete relationships from relationship index and delete relationships
  for (const [ relationshipName, deleteRelationship_Ids ] of byRelationship) {
    await delete_IdsFromRelationshipIndex(relationshipName, deleteRelationship_Ids)

    for (const deleteRelationship_Id of deleteRelationship_Ids) {
      write({ $aA: 'delete', $aK: deleteRelationship_Id })
    }
  }


  // delete requested node ids
  for (let i = 0; i < ids.length; i++) {
    write({ $aA: 'delete', $aK: ids[i] })
  }


  // delete ids that are cascade
  if (cascadeIds.length) await deleteNodes(cascadeIds)
}
