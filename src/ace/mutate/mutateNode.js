import { td } from '#ace'
import { memory } from '../../memory/memory.js'
import { AceError } from '../../objects/AceError.js'
import { write, getMany, getOne } from '../storage.js'
import { schemaDeleteConclude, schemaDeleteNodes } from './mutateSchema.js'
import { deleteIdFromRelationshipProp, delete_IdFromRelationshipIndex } from './mutateRelationship.js'
import { RELATIONSHIP_PREFIX, getNodeNamePlusRelationshipNameToNodePropNameMapKey, getNodeIdsKey, getRelationshipNameFromProp } from '../../util/variables.js'


/**
 * @param { (string | number)[] } ids
 * @returns { Promise<void> }
 */
export async function deleteNodesByIds (ids) {
  if (!Array.isArray(ids) || !ids.length) throw AceError('aceFn__deleteNodesByIds__invalidIds', 'The request fails b/c ids must be an array of ids', { ids })

  /** @type { Map<string | number, td.AceGraphNode> } */
  const graphNodes = await getMany(ids)

  for (const entry of graphNodes) {
    const relationshipIdsArray = []

    /** @type { Map<string | number, { propName: string, relationshipName: string, cascade: boolean }> } <relationshipId, { propName, relationshipName }> */
    const relationshipIdsMap = new Map()

    for (const propName in entry[1]) {
      if (propName.startsWith(RELATIONSHIP_PREFIX)) {
        const relationshipName = getRelationshipNameFromProp(propName)
        const schemaPropName = memory.txn.schemaDataStructures.nodeNamePlusRelationshipNameToNodePropNameMap?.get(getNodeNamePlusRelationshipNameToNodePropNameMapKey(entry[1].node, relationshipName))

        const cascade = schemaPropName ? (memory.txn.schemaDataStructures.cascade?.get(entry[1].node)?.has(schemaPropName) || false) : false

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

    if (cascadeIds.length) await deleteNodesByIds(cascadeIds) // delete ids that are cascade
  }
}


/**
 * @param { td.AceMutateRequestItemNodePropDeleteData } reqItem
 * @returns { Promise<void> }
 */
export async function nodePropDeleteData (reqItem) {
  if (!Array.isArray(reqItem?.how?.ids) || !reqItem.how.ids.length) throw AceError('aceFn__nodePropDeleteData__invalidIds', 'The request fails b/c reqItem.how.ids must be an array of ids', { reqItem })
  if (!Array.isArray(reqItem?.how?.props) || !reqItem.how.props.length) throw AceError('aceFn__nodePropDeleteData__invalidProps', 'The request fails b/c reqItem.how.props must be an array of string props', { reqItem })
  if (reqItem.how.props.includes('id')) throw AceError('aceFn__nodePropDeleteData__invalidId', 'The request fails b/c reqItem.how.props may not include the prop id', { reqItem })

  /** @type { Map<string | number, td.AceGraphNode> } */
  const graphNodes = await getMany(reqItem.how.ids)

  for (const entry of graphNodes) {
    for (const propName of reqItem.how.props) {
      if (typeof entry[1].props[propName] !== 'undefined') {
        if (!memory.txn.schema?.nodes[entry[1].node]?.[propName]) throw AceError('aceFn__nodePropDeleteData__invalidNodePropCombo', 'The node and the prop cannot be deleted b/c they are not defined in your schema', { node: entry[1].node, prop: propName })

        delete entry[1].props[propName]
        write('update', entry[0], entry[1])
      }
    }
  }
}


/** 
 * @param { td.AceFnOptions } options
 * @param { td.AceMutateRequestItemNodeDeleteDataAndDeleteFromSchema } reqItem
 * @returns { Promise<void> }
 */
export async function nodeDeleteDataAndDeleteFromSchema (options, reqItem) {
  for (const requestNodeName of reqItem.how.nodes) {
    const nodeIdsKey = getNodeIdsKey(requestNodeName)

    /** @type { (string | number)[] } */
    const nodeIds = await getOne(nodeIdsKey)

    if (nodeIds?.length) {
      await deleteNodesByIds(nodeIds)
      write('delete', nodeIdsKey)
    }

    schemaDeleteNodes(requestNodeName)
    delete memory.txn.schema?.nodes[requestNodeName]
  }

  schemaDeleteConclude(options)
}


/** 
 * @param { td.AceFnOptions } options
 * @param { td.AceMutateRequestItemNodePropDeleteDataAndDeleteFromSchema } reqItem
 * @returns { Promise<void> }
 */
export async function nodePropDeleteDataAndDeleteFromSchema (options, reqItem) {
  for (const { node, prop } of reqItem.how.props) {
    if (!memory.txn.schema?.nodes[node]?.[prop]) throw AceError('nodePropDeleteDataAndDeleteFromSchema__invalidNodePropCombo', 'The node and the prop cannot be deleted b/c they are are not defined in your schema', { reqItem, node, prop })
    if (/** @type {*} */ (prop) === 'id') throw AceError('aceFn__nodePropDeleteDataAndDeleteFromSchema__invalidId', 'The request fails b/c reqItem.how.props may not include the prop id', { reqItem, node, prop })

    const nodeIdsKey = getNodeIdsKey(node)

    /** @type { (string | number)[] } */
    const nodeIds = await getOne(nodeIdsKey)

    if (nodeIds.length) {
      /** @type { Map<string|number, td.AceGraphNode> } */
      const graphNodes = await getMany(nodeIds)

      for (const entry of graphNodes) {
        if (typeof entry[1].props[prop] !== 'undefined') {
          delete entry[1].props[prop]
          write('update', entry[0], entry[1])
        }
      }
    }

    delete memory.txn.schema.nodes[node][prop]
    schemaDeleteConclude(options)
  }
}
