import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { overwriteIds } from './overwriteIds.js'
import { getGraphId } from '../id/getGraphId.js'
import { applyDefaults } from './applyDefaults.js'
import { AceError } from '../../objects/AceError.js'
import { write, getOne } from '../../util/storage.js'
import { hashMutationProp } from './hashMutationProp.js'
import { enumIdToGraphId } from '../id/enumIdToGraphId.js'
import { addToSortIndexMap } from './addToSortIndexMap.js'
import { validatePropValue } from '../../util/validatePropValue.js'
import { ENUM_ID_PREFIX, ADD_NOW_DATE, RELATIONSHIP_PREFIX, getUniqueIndexKey, getNow, getNodeIdsKey } from '../../util/variables.js'



/**
 * Insert, Update or Upsert Nodes
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate | td.AceMutateRequestItemNodeUpsert } reqItem 
 * @returns { Promise<void> }
 */
export async function inupNode (jwks, reqItem) {
  const inupNodesArray = /** @type { [ td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate, string ][] } */ ([]) // In this array we keep track of meta data for all the items we want to add to the graph. We need to go though all the ids once first to fully populate newIdsMap
  await populateInupNodesArray(jwks, reqItem, inupNodesArray)
  await implementInupNodesArray(inupNodesArray)
}


/**
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate | td.AceMutateRequestItemNodeUpsert } reqItem 
 * @param { [ td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate, (string | number) ][] } inupNodesArray 
 * @returns { Promise<void> }
 */
async function populateInupNodesArray (jwks, reqItem, inupNodesArray) {
  if (Memory.txn.schema?.nodes[reqItem?.how.node]) {
    const startsWithIdPrefix = typeof reqItem.how.props.id === 'string' && reqItem.how.props.id.startsWith(ENUM_ID_PREFIX)

    /** @type { td.AceGraphNode | undefined } */
    let graphNode

    switch (reqItem.do) {
      case 'NodeInsert':
        reqItem = /** @type { td.AceMutateRequestItemNodeInsert } */ (reqItem)
        break
      case 'NodeUpdate':
        reqItem = /** @type { td.AceMutateRequestItemNodeUpdate } */(reqItem)
        break
      case 'NodeUpsert':
        reqItem.how.props.id = enumIdToGraphId({ id: reqItem.how.props.id })
        graphNode = await getOne(reqItem.how.props.id)
        reqItem = /** @type { * } */(reqItem)

        if (graphNode) {
          reqItem.do = 'NodeUpdate'
          reqItem = /** @type { td.AceMutateRequestItemNodeUpdate } */(reqItem)
        } else {
          reqItem.do = 'NodeInsert'
          reqItem = /** @type { td.AceMutateRequestItemNodeInsert } */(reqItem)
        }
        break
    }

    applyDefaults(reqItem.how.node, reqItem.how.props)

    if (reqItem.do === 'NodeUpdate') {
      if (!graphNode) {
        reqItem.how.props.id = enumIdToGraphId({ id: reqItem.how.props.id })
        graphNode = await getOne(reqItem.how.props.id)
      }

      if (!graphNode) throw AceError('inupNode__invalidUpdateId', `Please ensure each reqItem.how.props.id is defined in your graph, this is not happening yet for the reqItem.how.props.id: ${ reqItem.how.props.id }`, { reqItem })

      for (const propName in graphNode) {
        if (propName.startsWith(RELATIONSHIP_PREFIX)) { // transfer all $r from graphNode into reqItem
          /** @type { td.AceMutateRequestItemNodeWithRelationships } */(reqItem)[propName] = graphNode[propName]
        }
      }

      reqItem.how.props = { ...graphNode.props, ...reqItem.how.props } // transfer additional graphNode.props into reqItem.how.props
    }

    let graphId

    if (reqItem.do === 'NodeUpdate') graphId = reqItem.how.props.id
    else {
      if (reqItem.how.props.id && startsWithIdPrefix) graphId = await getGraphIdAndAddToMapIds(reqItem.how.props.id, startsWithIdPrefix)
      else if (!reqItem.how.props.id) reqItem.how.props.id = graphId = await getGraphId()
      else graphId = reqItem.how.props.id

      /** @type { (string | number)[] } */
      const nodeIds = await getOne(getNodeIdsKey(reqItem.how.node)) || []
      nodeIds.push(graphId)
      write('upsert', getNodeIdsKey(reqItem.how.node), nodeIds)
    }

    for (const propName in reqItem.how.props) { // loop each request property => validate each property => IF invalid throw errors => IF valid do index things
      const props = reqItem.how.props
      const schemaProp = /** @type { td.AceSchemaProp } */ (Memory.txn.schema?.nodes?.[reqItem.how.node][propName])

      if (propName !== 'id') {
        if (schemaProp?.is !== 'Prop') throw AceError('inupNode__invalidNodeProp', `The node name: "${ reqItem.how.node }" and the prop name: "${ propName }" do not exist in the schema. Please ensure when mutating nodes the node name and prop name exist in the schema.`, { reqItem, nodePropName: propName })

        const _errorData = { schemaProp, reqItem, propName, propValue: props[propName] }

        validatePropValue(propName, props[propName], schemaProp.options.dataType, reqItem.how.node, 'node', 'invalidPropValue', _errorData)

        if (schemaProp.options.dataType === 'hash') await hashMutationProp('node', reqItem.how.node, props, propName, props[propName], schemaProp, jwks, reqItem.how.$o?.privateJWK)
        if (schemaProp.options.dataType === 'iso' && props[propName] === ADD_NOW_DATE) props[propName] = getNow()
        if (schemaProp.options.uniqueIndex && typeof props[propName] !== 'undefined') write('upsert', getUniqueIndexKey(reqItem.how.node, propName, props[propName]), graphId)
        if (schemaProp.options.sortIndex) addToSortIndexMap(schemaProp, reqItem.how.node, propName, graphId)
      }
    }

    inupNodesArray.push([reqItem, graphId]) // add meta data about each value to sertNodesArray array, we need to loop them all first, before adding them to the graph, to populate newIdsMap
  }
}


/**
 * @param { [ td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate, string ][] } inupNodesArray - [ reqItem, graphId ]
 * @returns { Promise<void> }
 */
async function implementInupNodesArray (inupNodesArray) {
  for (const entry of inupNodesArray) { // loop the ids that we'll add to the graph
    for (const reqItemKey in entry[0].how.props) {
      overwriteIds(entry[0].how.props, reqItemKey)
    }

    if (entry[0].how.props.$o) delete entry[0].how.props.$o

    if (entry[0].how.props.id) {
      if (entry[0].do === 'NodeInsert') write('insert', entry[0].how.props.id, entry[0].how)
      else write('update', entry[0].how.props.id, entry[0].how)
    }
  }
}


/**
 * @param { string | number } reqId 
 * @param { boolean } startsWithIdPrefix 
 * @returns { Promise<number | string> }
 */
async function getGraphIdAndAddToMapIds (reqId, startsWithIdPrefix) {
  /** This will be the id that is added to the graph */
  let graphId

  if (typeof reqId !== 'string' && typeof reqId !== 'number') throw AceError('inupNode__idInvalidType', `Please ensure the reqId is of type number or string, this is not happening yet for the reqId: ${ reqId }`, { reqId })

  if (!startsWithIdPrefix) graphId = reqId
  else {
    if (Memory.txn.enumGraphIdsMap.get(reqId)) throw AceError('inupNode__duplicateId', `Please ensure enumId's are not the same for multiple nodes. The enumId: ${ reqId } is being used as the id for multiple nodes`, { enumId: reqId })

    graphId = await getGraphId()
    Memory.txn.enumGraphIdsMap.set(reqId, graphId)
  }

  return graphId
}
