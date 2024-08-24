// INTERNAL OR EXTERNAL (So exported @ index.js)

export const vars = {
  enumIdPrefix: '_:',
  nowIsoPlaceholder: 'now',
  preQueryOptionsFlow: [
    'flow',
    'alias',
    'fill',
    'publicJWKs',
    'limit', // limit done b4 props defined IF no $o below this in preQueryOptionsFlow or defaultQueryOptionsFlow
    'sort', // IF sort schema index is defined for the sort prop, then we get sorted ids from index
    'findById',
    'findBy_Id',
    'findByUnique',
    'filterByIds',
    'filterBy_Ids',
    'filterByUniques',
  ],
  defaultQueryOptionsFlow: [ // configurable
    'countAsProp',
    'sumAsProp',
    'avgAsProp',
    'minAmtAsProp',
    'maxAmtAsProp',

    'newProps',
    'propAdjToRes',

    'findByOr',
    'findByAnd',
    'findByDefined',
    'findByUndefined',
    'findByPropValue',
    'findByPropProp',
    'findByPropRes',

    'filterByOr',
    'filterByAnd',
    'filterByDefined',
    'filterByUndefined',
    'filterByPropValue',
    'filterByPropProp',
    'filterByPropRes',

    'sort', // IF sort schema index is not defined for the sort prop then we manually sort
    'countAdjToRes',
    'limit',
  ],
  postQueryOptions: [
    'resHide',
    'propAsRes',
    'countAsRes',
    'sumAsRes',
    'avgAsRes',
    'minAmtAsRes',
    'maxAmtAsRes',
    'minNodeAsRes',
    'maxNodeAsRes',
  ]
}


/** @returns { string } */
export function getNow () {
  return (new Date()).toISOString()
}






// INTERNAL ONLY (So not exported @ index.js)

export const schemaId = '$aceId'

export const delimiter = '___'

const keyStart = '$ace' + delimiter
const relationship_IdsKeyStart = keyStart + 'index' + delimiter + 'relationships' + delimiter
const nodeIdsKeyStart = keyStart + 'index' + delimiter + 'nodes' + delimiter

export const lastIdKey = '$ace___last___id' // helps with typedefs to be specific and not use +

export const cryptAlgorithm = { name: 'AES-GCM', length: 256 }
export const importGenerateAlgorithm = { name: 'ECDSA', namedCurve: 'P-521' }
export const signVerifyAlgorithm = { name: 'ECDSA', hash: { name: 'SHA-512' } }

// export const maxAolByteAmount = 81000000 // 81 MB
export const maxAolByteAmount = 900


/**
 * @param { string } nodeOrRelationshipName
 * @param { string } propKey
 * @param { string | boolean | number } propValue
 * @returns { string }
 */
export function getUniqueIndexKey (nodeOrRelationshipName, propKey, propValue) {
  return keyStart + 'index' + delimiter + 'unique' + delimiter + nodeOrRelationshipName + delimiter + propKey + delimiter + encodeURIComponent(String(propValue))
}


/**
 * @param { string } nodeOrRelationshipName
 * @param { string } propKey
 * @returns { string }
 */
export function getSortIndexKey (nodeOrRelationshipName, propKey) {
  return keyStart + 'index' + delimiter + 'sort' + delimiter + nodeOrRelationshipName + delimiter + propKey
}


/**
 * @param { string } nodeName
 * @returns { string }
 */
export function getNodeIdsKey (nodeName) {
  return nodeIdsKeyStart + nodeName
}


/**
 * @param { string } relationshipName
 * @returns { string }
 */
export function getRelationship_IdsKey (relationshipName) {
  return relationship_IdsKeyStart + relationshipName
}


/**
 * @param { string } graphName
 * @param { number } position
 * @returns { string }
 */
export function getGraphPositionKey (graphName, position) {
  return graphName + delimiter + position
}


/**
 * Env is the env that created this graph
 * @param { string } env
 * @param { number } lastId
 * @returns { string }
 */
export function getGraphName (env, lastId) {
  return lastId + delimiter + env
}
