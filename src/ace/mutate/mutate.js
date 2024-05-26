import { td, enums } from '#ace'
import { sign } from '../../security/hash.js'
import { getGraphId } from '../getGraphId.js'
import { write, getOne } from '../storage.js'
import { memory } from '../../memory/memory.js'
import { AceError } from '../../objects/AceError.js'
import { enumIdToGraphId } from '../enumIdToGraphId.js'
import { deleteIdFromRelationshipProp } from './mutateRelationship.js'
import { ENUM_ID_PREFIX, ADD_NOW_DATE, RELATIONSHIP_PREFIX, getUniqueIndexKey, getNow, getNodeIdsKey, getRelationshipProp, getRelationshipIdsKey, getSortIndexKey } from '../../util/variables.js'



/**
 * Add nodes for insert or update to putEntries
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate | td.AceMutateRequestItemNodeUpsert } reqItem 
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
  if (memory.txn.schema?.nodes[reqItem?.how.node]) {
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


    if (reqItem.do === 'NodeUpdate') {
      if (!graphNode) {
        reqItem.how.props.id = enumIdToGraphId({ id: reqItem.how.props.id })
        graphNode = await getOne(reqItem.how.props.id)
      }

      if (!graphNode) throw AceError('acFn__mutate__invalidUpdateId', `Please pass a request item id that is a id defined in your graph, the id \`${ reqItem.how.props.id }\` is not defined in your graph`, { reqItem })

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
      const schemaProp = /** @type { td.AceSchemaProp } */ (memory.txn.schema?.nodes?.[reqItem.how.node][nodePropName])

      if (nodePropName !== '$o' && nodePropName !== 'id') {
        if (schemaProp?.is !== 'Prop') throw AceError('aceFn__mutate__invalidSchemaProp', `The node name ${ reqItem.how.node } with the prop name ${ nodePropName } is invalid because it is not defined in your schema`, { reqItem, nodePropName })

        const _errorData = { schemaProp, reqItem, nodePropName, nodePropValue }

        if (schemaProp.options.dataType === 'string' && typeof nodePropValue !== 'string') throw AceError('aceFn__mutate__invalidPropValue__string', `The node name ${ reqItem.how.node } with the prop name ${ nodePropName } is invalid because when the schema property data type is "isoString", the request typeof must be a "string"`, _errorData)
        if (schemaProp.options.dataType === 'isoString' && typeof nodePropValue !== 'string') throw AceError('aceFn__mutate__invalidPropValue__isoString', `The node name ${ reqItem.how.node } with the prop name ${ nodePropName } is invalid because when the schema property data type is "isoString", the request typeof must be a "string"`, _errorData)
        if (schemaProp.options.dataType === 'number' && typeof nodePropValue !== 'number') throw AceError('aceFn__mutate__invalidPropValue__number', `The node name ${ reqItem.how.node } with the prop name ${ nodePropName } is invalid because when the schema property data type is "number", the request typeof must be a "number"`, _errorData)
        if (schemaProp.options.dataType === 'boolean' && typeof nodePropValue !== 'boolean') throw AceError('aceFn__mutate__invalidPropValue__boolean', `The node name ${ reqItem.how.node } with the prop name ${ nodePropName } is invalid because when the schema property data type is "boolean", the request typeof must be a "boolean"`, _errorData)

        if (schemaProp.options.dataType === 'hash') {
          const jwkName = reqItem.how.props.$o?.privateJWK

          if (!jwkName) throw AceError('aceFn__mutate__falsyOptionsPrivateJwk', `The node name ${ reqItem.how.node } with the prop name ${ nodePropName } is invalid because reqItem.how.props.$o does not have a PrivateJWK. Example: reqItem.$o: { privateJWK: 'password' }`, _errorData)
          if (!jwks.private[jwkName]) throw AceError('aceFn__mutate__falsyRequestItemPrivateJwk', `The node name ${ reqItem.how.node } with the prop name ${ nodePropName } is invalid because reqItem.how.props.$o[PrivateJWK].name does not align with any request.privateJWKs. Names must align.`, _errorData)

          reqItemX[nodePropName] = await sign(nodePropValue, jwks.private[jwkName])
        }

        if (schemaProp.options.uniqueIndex) write('upsert', getUniqueIndexKey(reqItem.how.node, nodePropName, nodePropValue), graphId)

        if (schemaProp.options.sortIndex) {
          const key = getSortIndexKey(reqItem.how.node, nodePropName)
          const value = memory.txn.sortIndexMap.get(key) || { propName: nodePropName, newIds: /** @type { string[] } */ ([]) }

          value.newIds.push(graphId)
          memory.txn.sortIndexMap.set(key, value)
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
 * @param { string | number } insertId 
 * @param { boolean } startsWithIdPrefix 
 * @returns { Promise<number | string> }
 */
async function getGraphIdAndAddToMapIds (insertId, startsWithIdPrefix) {
  /** This will be the id that is added to the graph */
  let graphId

  if (typeof insertId !== 'string') throw AceError('aceFn__mutate_idInvalidType', `The id ${ insertId } is invalid because the type is not string, please include only typeof "string" for each id`, { id: insertId })

  if (!startsWithIdPrefix) graphId = insertId
  else {
    if (memory.txn.enumGraphIdsMap.get(insertId)) throw AceError('aceFn__mutate__duplicateId', `The id ${ insertId } is invalid because it is included as a id for multiple nodes, please do not include duplicate ids for insert`, { id: insertId })

    graphId = await getGraphId()
    memory.txn.enumGraphIdsMap.set(insertId, graphId)
  }

  return graphId
}

// 
/**
 * Insert / Update Relationships
 * @param { td.AceMutateRequestItemRelationshipInup } reqItem 
 */
export async function inupRelationship (reqItem) {
  if (memory.txn.schema?.relationships?.[reqItem?.how?.relationship]) {
    const schemaRelationship = memory.txn.schema?.relationships?.[reqItem.how.relationship]

    if (!schemaRelationship) throw AceError('aceFn__mutate__unknownRelationshipName', `The relationship name \`${reqItem.how.relationship}\` is not defined in your schema, please include a relationship name that is defined in your schema`, { relationshipName: reqItem.how.relationship })

    /** @type { td.AceGraphNode | undefined } */
    let graphNode

    switch (reqItem.do) {
      case 'RelationshipInsert':
        reqItem = /** @type { td.AceMutateRequestItemRelationshipInsert } */ (reqItem)
        break
      case 'RelationshipUpdate':
        reqItem = /** @type { td.AceMutateRequestItemRelationshipUpdate } */(reqItem)
        break
      case 'RelationshipUpsert':
        reqItem.how.props._id = enumIdToGraphId({ id: reqItem.how.props._id })
        graphNode = await getOne(reqItem.how.props._id)
        reqItem = /** @type { * } */(reqItem)

        if (graphNode) {
          reqItem.do = 'RelationshipUpdate'
          reqItem = /** @type { td.AceMutateRequestItemRelationshipUpdate } */(reqItem)
        } else {
          reqItem.do = 'RelationshipInsert'
          reqItem = /** @type { td.AceMutateRequestItemRelationshipInsert } */(reqItem)
        }
        break
    }

    if (reqItem.do === 'RelationshipUpdate') {
      if (!graphNode) graphNode = await getOne(reqItem.how.props._id)
      if (!graphNode) throw AceError('aceFn__mutate__invalidUpdateId', `Please pass a request item id that is a id defined in your graph, the id \`${ reqItem.how.props._id } \` is not defined in your graph`, { reqItem })
      if (graphNode.relationship !== reqItem.how.relationship) throw AceError('aceFn__mutate__invalidUpdateRelationshipName', `Please pass a request item id that is a id defined in your graph with a matching graphNode.relationship: \`${graphNode.relationship}\`,  and reqItem.how.relationship: \`${ reqItem.how.relationship }\``, { reqItem, graphNodeRelationship: graphNode.relationship })

      const aIsDifferent = graphNode.props.a !== reqItem.how.props.a
      const bIsDifferent = graphNode.props.b !== reqItem.how.props.b

      if (aIsDifferent) updatePreviousRelationshipNode(aIsDifferent, graphNode.a, reqItem)
      if (bIsDifferent) updatePreviousRelationshipNode(bIsDifferent, graphNode.b, reqItem)

      reqItem.how.props = { ...graphNode.props, ...reqItem.how.props }
    }

    await inupRelationshipPut(reqItem, schemaRelationship)
  }
}


/**
 * @param { boolean } isDifferent 
 * @param { string } deletedNodeId 
 * @param { td.AceMutateRequestItemRelationshipUpdate } reqItem 
 */
async function updatePreviousRelationshipNode (isDifferent, deletedNodeId, reqItem) {
  if (isDifferent) {
    /** @type { td.AceGraphNode } */
    const relationshipNode = await getOne(deletedNodeId)

    if (relationshipNode && reqItem.how.props._id) {
      await deleteIdFromRelationshipProp(getRelationshipProp(reqItem.how.relationship), reqItem.how.props._id, relationshipNode)
    }
  }
}


/**
 * @param { td.AceMutateRequestItemNodeInsertProps | td.AceMutateRequestItemNodeUpdateProps } props
 * @param { string | number } reqItemKey
 */
function overwriteIds (props, reqItemKey) {
  const reqItemValue = props[reqItemKey]

  if (typeof reqItemValue === 'string' && reqItemValue.startsWith(ENUM_ID_PREFIX)) {
    const graphId = memory.txn.enumGraphIdsMap.get(reqItemValue)

    if (graphId) props[reqItemKey] = graphId
    else throw AceError('aceFn__mutate__invalidId', `The id ${ reqItemValue } is invalid b/c each id, with an Ace id prefix, must be defined in a node`, { id: reqItemValue })
  }
}


/**
 * @param { td.AceMutateRequestItemRelationshipInup } reqItem 
 * @param { td.AceSchemaRelationshipValue } schemaRelationship 
 */
async function inupRelationshipPut (reqItem, schemaRelationship) {
  const props = reqItem.how.props

  if (reqItem.do === 'RelationshipInsert') props._id = await getGraphId()

  for (const relationshipPropName in reqItem.how.props) {
    const relationshipPropValue = props[relationshipPropName]

    if (relationshipPropValue === ADD_NOW_DATE && schemaRelationship.props?.[relationshipPropName]?.options?.dataType === enums.dataTypes.isoString) props[relationshipPropName] = getNow() // populate now timestamp
    else if (typeof relationshipPropValue === 'string' && relationshipPropValue.startsWith(ENUM_ID_PREFIX)) {
      overwriteIds(reqItem.how.props, relationshipPropName)
    }
  }

  const relationshipProp = getRelationshipProp(reqItem.how.relationship)
  await addRelationshipToNode('a', reqItem, relationshipProp, props)
  await addRelationshipToNode('b', reqItem, relationshipProp, props)

  if (reqItem.do === 'RelationshipInsert') write('insert', props._id, reqItem.how)
  else write('update', props._id, reqItem.how)

  const relationshipIdsKey = getRelationshipIdsKey(reqItem.how.relationship)

  /** @type { (string | number)[] } */
  const relationshipIdsArray = await getOne(relationshipIdsKey) || []
  const relationshipIdsSet = new Set(relationshipIdsArray)

  relationshipIdsSet.add(props._id) // add relationship id to relationship index

  if (reqItem.do === 'RelationshipInsert') write('insert', relationshipIdsKey, [ ...relationshipIdsSet ])
  else write('update', relationshipIdsKey, [ ...relationshipIdsSet ])
}


/**
 * @param { 'a' | 'b' } direction
 * @param { td.AceMutateRequestItemRelationshipInup } reqItem
 * @param { string } relationshipProp
 * @param { td.AceMutateRequestItemRelationshipInUpProps } props
 */
async function addRelationshipToNode (direction, reqItem, relationshipProp, props) {
  const graphNodeId = reqItem.how.props[direction]

  if (graphNodeId) {
    /** @type { td.AceGraphNode } */
    const graphNode = await getOne(graphNodeId)

    if (!graphNode?.[relationshipProp]) graphNode[relationshipProp] = [props._id]
    else graphNode[relationshipProp].push(props._id)

    if (reqItem.do === 'RelationshipInsert') write('insert', graphNode.props.id, graphNode)
    else write('update', graphNode.props.id, graphNode)
  }
}

