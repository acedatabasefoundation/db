import { enums, td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { overwriteIds } from './overwriteIds.js'
import { getGraphId } from '../id/getGraphId.js'
import { applyDefaults } from './applyDefaults.js'
import { AceError } from '../../objects/AceError.js'
import { write, getOne } from '../../util/storage.js'
import { hashMutationProp } from './hashMutationProp.js'
import { enumIdToGraphId } from '../id/enumIdToGraphId.js'
import { addToSortIndexMap } from './addToSortIndexMap.js'
import { encryptMutationProp } from './encryptMutationProp.js'
import { validatePropValue } from '../../util/validatePropValue.js'
import { vars, getUniqueIndexKey, getNow, getNodeIdsKey } from '../../util/variables.js'


/**
 * Insert, Update or Upsert Nodes
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceFnOptions } options
 * @param { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate | td.AceMutateRequestItemNodeUpsert } reqItem 
 * @returns { Promise<void> }
 */
export async function inupNode (jwks, options, reqItem) {
  const inupNodesArray = /** @type { [ td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate, string ][] } */ ([]); // In this array we keep track of meta data for all the items we want to add to the graph. We need to go though all the ids once first to fully populate newIdsMap
  await populateInupNodesArray(jwks, reqItem, inupNodesArray, options)
  await implementInupNodesArray(inupNodesArray)
}


/**
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate | td.AceMutateRequestItemNodeUpsert } reqItem 
 * @param { [ td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate, (string | number) ][] } inupNodesArray 
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
async function populateInupNodesArray (jwks, reqItem, inupNodesArray, options) {
  if (Memory.txn.schema?.nodes[reqItem?.how.node]) {
    const startsWithIdPrefix = typeof reqItem.how.props.id === 'string' && reqItem.how.props.id.startsWith(vars.enumIdPrefix)

    /** @type { td.AceGraphNode | undefined } */
    let graphNode

    switch (reqItem.do) {
      case 'NodeInsert':
        reqItem = /** @type { td.AceMutateRequestItemNodeInsert } */ (reqItem);
        break
      case 'NodeUpdate':
        reqItem = /** @type { td.AceMutateRequestItemNodeUpdate } */(reqItem);
        break
      case 'NodeUpsert':
        reqItem.how.props.id = enumIdToGraphId({ id: reqItem.how.props.id })
        graphNode = /** @type { td.AceGraphNode | undefined } */ (await getOne(reqItem.how.props.id))
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
        graphNode = /** @type { td.AceGraphNode | undefined } */ (await getOne(reqItem.how.props.id))
      }

      if (!graphNode) throw new AceError('inupNode__invalidUpdateId', `Please ensure each reqItem.how.props.id is defined in your graph, this is not happening yet for the reqItem.how.props.id: ${ reqItem.how.props.id }`, { reqItem })

      const nodeRelationshipPropsMap = Memory.txn.schemaDataStructures.nodeRelationshipPropsMap.get(graphNode.$aN)

      if (nodeRelationshipPropsMap) {
        for (const entry of nodeRelationshipPropsMap) {
          /** @type { td.AceMutateRequestItemNodeWithRelationships } */(reqItem)[entry[1].prop] = graphNode[entry[1].prop]
        }
      }

      for (let key in graphNode) { // transfer additional graphNode.props into reqItem.how.props: { ...graphNode.props, ...reqItem.how.props }
        if (key !== '$aA' && key !== '$aN' && key !== '$aK' && typeof reqItem.how.props[key] === 'undefined') {
          reqItem.how.props[key] = graphNode[key]
        }
      }
    }

    let graphId

    if (reqItem.do === 'NodeUpdate') graphId = reqItem.how.props.id
    else {
      if (reqItem.how.props.id && startsWithIdPrefix) graphId = await getGraphIdAndAddToMapIds(reqItem.how.props.id, startsWithIdPrefix)
      else if (!reqItem.how.props.id) reqItem.how.props.id = graphId = await getGraphId()
      else graphId = reqItem.how.props.id

      /** @type { (string | number)[] } */
      let index = []
      const $aK = getNodeIdsKey(reqItem.how.node)
      const nodeIds = /** @type { td.AceGraphIndex | undefined } */ (await getOne($aK));

      if (Array.isArray(nodeIds?.index)) index = nodeIds.index

      index.push(graphId)

      write({ $aA: 'upsert', $aK, index })
    }

    for (const propName in reqItem.how.props) { // loop each request property => validate each property => IF invalid throw errors => IF valid do index things
      const schemaProp = /** @type { td.AceSchemaProp } */ (Memory.txn.schema?.nodes?.[reqItem.how.node][propName]);

      if (propName !== 'id') {
        if (schemaProp?.is !== 'Prop') throw new AceError('inupNode__invalidNodeProp', `The node name: "${ reqItem.how.node }" and the prop name: "${ propName }" do not exist in the schema. Please ensure when mutating nodes the node name and prop name exist in the schema.`, { reqItem, nodePropName: propName })

        validatePropValue(propName, reqItem.how.props[propName], schemaProp.options.dataType, reqItem.how.node, 'node', 'invalidPropValue', { schemaProp, reqItem, propName, propValue: reqItem.how.props[propName] })

        if (schemaProp.options.dataType === 'encrypt') await encryptMutationProp('node', reqItem.how.node, reqItem.how.props, propName, reqItem.how.props[propName], schemaProp, jwks, options.ivs, reqItem.how.$o?.cryptJWK, reqItem.how.$o?.iv)
        if (schemaProp.options.dataType === 'hash') await hashMutationProp('node', reqItem.how.node, reqItem.how.props, propName, reqItem.how.props[propName], schemaProp, jwks, reqItem.how.$o?.privateJWK)
        if (schemaProp.options.dataType === 'iso' && reqItem.how.props[propName] === vars.nowIsoPlaceholder) reqItem.how.props[propName] = getNow()
        if (schemaProp.options.uniqueIndex && typeof reqItem.how.props[propName] !== 'undefined') write({ $aA: 'upsert', $aK: getUniqueIndexKey(reqItem.how.node, propName, reqItem.how.props[propName]), index: graphId })
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
  for (let i = 0; i < inupNodesArray.length; i++) { // loop the ids that we'll add to the graph
    const { id, ...propsWithoutId } = inupNodesArray[i][0].how.props

    const graphItem = {
      $aK: id,
      $aN: inupNodesArray[i][0].how.node,
      $aA: inupNodesArray[i][0].do === 'NodeInsert' ? 'insert' : 'update',
      ...propsWithoutId,
    }

    if (typeof graphItem.$aK === 'string') overwriteIds(graphItem, '$aK')
    write(/** @type {td.AceGraphNode} */ (graphItem))
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

  if (typeof reqId !== 'string' && typeof reqId !== 'number') throw new AceError('inupNode__idInvalidType', `Please ensure the reqId is of type number or string, this is not happening yet for the reqId: ${ reqId }`, { reqId })

  if (!startsWithIdPrefix) graphId = reqId
  else {
    if (Memory.txn.enumGraphIds.has(/** @type { string } */ (reqId))) throw new AceError('inupNode__duplicateId', `Please ensure enumId's are not the same for multiple nodes. The enumId: ${ reqId } is being used as the id for multiple nodes`, { enumId: reqId })

    graphId = await getGraphId()
    Memory.txn.enumGraphIds.set(/** @type { string } */ (reqId), graphId)
  }

  return graphId
}
