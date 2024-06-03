import { td } from '#ace'
import { sign } from '../../security/hash.js'
import { Memory } from '../../objects/Memory.js'
import { overwriteIds } from './overwriteIds.js'
import { getGraphId } from '../id/getGraphId.js'
import { applyDefaults } from './applyDefaults.js'
import { AceError } from '../../objects/AceError.js'
import { write, getOne } from '../../util/storage.js'
import { enumIdToGraphId } from '../id/enumIdToGraphId.js'
import { ENUM_ID_PREFIX, ADD_NOW_DATE, RELATIONSHIP_PREFIX, getUniqueIndexKey, getNow, getNodeIdsKey, getSortIndexKey } from '../../util/variables.js'



/**
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate | td.AceMutateRequestItemNodeUpsert } reqItem 
 * @returns { Promise<void> }
 */
export async function inupNode (jwks, reqItem) {
  const inupNodesArray = /** @type { [ td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate, string ][] } */ ([]) // In this array we keep track of meta data for all the items we want to add to the graph. We need to go though all the ids once first to fully populate newIdsMap
  await populateInupNodesArray(reqItem, jwks, inupNodesArray)
  await implementInupNodesArray(inupNodesArray)
}


/**
 * @param { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate | td.AceMutateRequestItemNodeUpsert } reqItem 
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { [ td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate, (string | number) ][] } inupNodesArray 
 * @returns { Promise<void> }
 */
async function populateInupNodesArray (reqItem, jwks, inupNodesArray) {
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

      if (!graphNode) throw AceError('aceFn__invalidUpdateId', `Please ensure each reqItem.how.props.id is defined in your graph, this is not happening yet for the reqItem.how.props.id: ${ reqItem.how.props.id }`, { reqItem })

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

    for (const nodePropName in reqItem.how.props) { // loop each request property => validate each property => IF invalid throw errors => IF valid do index things
      const reqItemX = /** @type { { [k: string]: any } } */ (reqItem.how.props)
      const nodePropValue = reqItemX[nodePropName]
      const schemaProp = /** @type { td.AceSchemaProp } */ (Memory.txn.schema?.nodes?.[reqItem.how.node][nodePropName])

      if (nodePropName !== 'id') {
        if (schemaProp?.is !== 'Prop') throw AceError('aceFn__invalidSchemaProp', `Please ensure when mutating nodes the node name and prop name exist in the schema. This is not happening yet for the node name: ${ reqItem.how.node } and the prop name: ${ nodePropName }`, { reqItem, nodePropName })

        const _errorData = { schemaProp, reqItem, nodePropName, nodePropValue }

        if (schemaProp.options.dataType === 'string' && typeof nodePropValue !== 'string') throw AceError('aceFn__invalidPropValue__string', `Please ensure the node name ${ reqItem.how.node } with the prop name ${ nodePropName } is a typeof "string" because the schema property data type is "isoString"`, _errorData)
        if (schemaProp.options.dataType === 'isoString' && typeof nodePropValue !== 'string') throw AceError('aceFn__invalidPropValue__isoString', `Please ensure the node name ${ reqItem.how.node } with the prop name ${ nodePropName } is a typeof "string" because the schema property data type is "string"`, _errorData)
        if (schemaProp.options.dataType === 'number' && typeof nodePropValue !== 'number') throw AceError('aceFn__invalidPropValue__number', `Please ensure the node name ${ reqItem.how.node } with the prop name ${ nodePropName } is a typeof "number" because the schema property data type is "number"`, _errorData)
        if (schemaProp.options.dataType === 'boolean' && typeof nodePropValue !== 'boolean') throw AceError('aceFn__invalidPropValue__boolean', `Please ensure the node name ${ reqItem.how.node} with the prop name ${ nodePropName } is a typeof "boolean" because the schema property data type is "boolean"`, _errorData)

        if (schemaProp.options.dataType === 'hash') {
          const jwkName = reqItem.how.$o?.privateJWK

          if (!jwkName) throw AceError('aceFn__falsyOptionsPrivateJwk', `Please ensure the node name ${ reqItem.how.node } with the prop name ${ nodePropName } has a reqItem.how.$o PrivateJWK. Example: reqItem.how.$o: { privateJWK: 'password' }`, _errorData)
          if (!jwks.private[jwkName]) throw AceError('aceFn__falsyRequestItemPrivateJwk', `Please ensure the node name ${ reqItem.how.node } with the prop name ${ nodePropName } has reqItem.how.props.$o[PrivateJWK].name aligned with any ace() options.jwks.private name`, _errorData)

          reqItemX[nodePropName] = await sign(nodePropValue, jwks.private[jwkName])
        }

        if (schemaProp.options.uniqueIndex) write('upsert', getUniqueIndexKey(reqItem.how.node, nodePropName, nodePropValue), graphId)

        if (schemaProp.options.sortIndex) {
          const key = getSortIndexKey(reqItem.how.node, nodePropName)
          const value = Memory.txn.sortIndexMap.get(key) || { propName: nodePropName, newIds: /** @type { string[] } */ ([]) }

          value.newIds.push(graphId)
          Memory.txn.sortIndexMap.set(key, value)
        }

        if (schemaProp.options.dataType === 'isoString' && nodePropValue === ADD_NOW_DATE) reqItemX[nodePropName] = getNow()
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

  if (typeof reqId !== 'string' && typeof reqId !== 'number') throw AceError('aceFn__idInvalidType', `Please ensure the reqId is of type number or string, this is not happening yet for the reqId: ${ reqId }`, { reqId })

  if (!startsWithIdPrefix) graphId = reqId
  else {
    if (Memory.txn.enumGraphIdsMap.get(reqId)) throw AceError('aceFn__duplicateId', `Please ensure enumId's are not the same for multiple nodes. The enumId: ${ reqId } is being used as the id for multiple nodes`, { enumId: reqId })

    graphId = await getGraphId()
    Memory.txn.enumGraphIdsMap.set(reqId, graphId)
  }

  return graphId
}
