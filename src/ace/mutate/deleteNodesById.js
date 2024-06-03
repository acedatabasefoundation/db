import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { getMany, getOne, write } from '../../util/storage.js'
import { deleteIdFromRelationshipProp } from './deleteIdFromRelationshipProp.js'
import { delete_IdFromRelationshipIndex } from './delete_IdFromRelationshipIndex.js'
import { RELATIONSHIP_PREFIX, getNodeIdsKey, getNodeNamePlusRelationshipNameToNodePropNameMapKey, getRelationshipNameFromProp } from '../../util/variables.js'


/**
 * @param { (string | number)[] } ids
 * @returns { Promise<void> }
 */
export async function deleteNodesById (ids) {
  if (!Array.isArray(ids) || !ids.length) throw AceError('aceFn__deleteNodesById__invalidIds', 'Please enure calls to deleteNodesById() includes an array of populated ids', { ids })

  /** @type { Map<string | number, td.AceGraphNode> } */
  const graphNodes = await getMany(ids)

  for (const entry of graphNodes) {
    const relationshipIdsArray = []

    /** @type { Map<string | number, { propName: string, relationshipName: string, cascade: boolean }> } <relationshipId, { propName, relationshipName }> */
    const relationshipIdsMap = new Map()

    for (const propName in entry[1]) {
      if (propName.startsWith(RELATIONSHIP_PREFIX)) {
        const relationshipName = getRelationshipNameFromProp(propName)
        const schemaPropName = Memory.txn.schemaDataStructures.nodeNamePlusRelationshipNameToNodePropNameMap?.get(getNodeNamePlusRelationshipNameToNodePropNameMapKey(entry[1].node, relationshipName))

        const cascade = schemaPropName ? (Memory.txn.schemaDataStructures.cascade?.get(entry[1].node)?.has(schemaPropName) || false) : false

        for (const relationshipId of entry[1][propName]) {
          relationshipIdsArray.push(relationshipId)
          relationshipIdsMap.set(relationshipId, { propName, relationshipName, cascade })
        }
      }
    }

    const nodeIdsKey = getNodeIdsKey(entry[1].node)

    /** @type { (string | number)[] } */
    const nodeIds = await getOne(nodeIdsKey)

    if (Array.isArray(nodeIds)) {
      for (let i = nodeIds.length - 1; i >= 0; i--) {
        if (nodeIds[i] === entry[0]) {
          nodeIds.splice(i, 1)
          break
        }
      }
    }
    
    write('update', nodeIdsKey, nodeIds) // delete id from index___nodes___

    /** @type { Map<string | number, string | number> } <relationshipNodeId, relationshipId> */
    const relationshipNodeIds = new Map()

    /** @type { Map<string | number, td.AceGraphRelationship> } */
    const graphRelationshipsMap = await getMany(relationshipIdsArray)

    for (const entry of graphRelationshipsMap) {
      if (entry[1].props.a === entry[0]) relationshipNodeIds.set(entry[1].props.b, entry[1].props._id)
      if (entry[1].props.b === entry[0]) relationshipNodeIds.set(entry[1].props.a, entry[1].props._id)
    }

    const cascadeIds = []

    /** @type { Map<string | number, td.AceGraphNode> } */
    const graphRelationshipNodesMap = await getMany([ ...relationshipNodeIds.keys() ])

    for (const entry of graphRelationshipNodesMap) {
      const id = relationshipNodeIds.get(entry[1].props.id)

      if (id) {
        const v = relationshipIdsMap.get(id)

        if (v) {
          if (v.cascade) cascadeIds.push(entry[1].props.id)
          else if (v.propName) await deleteIdFromRelationshipProp(v.propName, id, entry[1])
        }
      }
    }

    write('delete', entry[0])

    for (const id of relationshipIdsArray) {
      write('delete', id)
      const v = relationshipIdsMap.get(id)
      if (v?.relationshipName) await delete_IdFromRelationshipIndex(v.relationshipName, id)
    }

    if (cascadeIds.length) await deleteNodesById(cascadeIds) // delete ids that are cascade
  }
}
