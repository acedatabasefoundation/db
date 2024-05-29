// INTERNAL OR EXTERNAL (So exported @ index.js / index.ts)

export const ADD_NOW_DATE = 'now'
export const ENUM_ID_PREFIX = '_:'
export const REQUEST_TOKEN_HEADER = 'ace_api_token'

export const PRE_QUERY_OPTIONS_FLOW = [
  'flow',
  'alias',
  'fill',
  'sort', // IF sort schema index is defined for the sort prop, then we get sorted ids from index
  'findById',
  'findBy_Id',
  'findByUnique',
  'filterByIds',
  'filterBy_Ids',
  'filterByUniques',
  'publicJWKs',
]

export const DEFAULT_QUERY_OPTIONS_FLOW = [ // configurable
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
]

export const POST_QUERY_OPTIONS_FLOW = [
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


/** @returns { string } */
export function getNow () {
  return (new Date()).toISOString()
}






// INTERNAL ONLY (So not exported @ index.js / index.ts)

export const SCHEMA_ID = '$aceId'

export const DELIMITER = '___'

export const KEY_START = '$ace' + DELIMITER
export const LAST_ID_KEY = KEY_START + 'last' + DELIMITER + 'id'
export const INDEX_NODE_IDS_PREFIX = KEY_START + 'index' + DELIMITER + 'nodes' + DELIMITER
export const INDEX_SORT = KEY_START + 'index' + DELIMITER + 'sort' + DELIMITER
export const INDEX_UNIQUE = KEY_START + 'index' + DELIMITER + 'unique' + DELIMITER
export const INDEX_RELATIONSHIP_IDS_PREFIX = KEY_START + 'index' + DELIMITER + 'relationships' + DELIMITER

export const RELATIONSHIP_PREFIX = '$r' + DELIMITER

export const cryptAlgorithm = { name: 'AES-GCM', length: 256 }
export const importGenerateAlgorithm = { name: 'ECDSA', namedCurve: 'P-521' }
export const signVerifyAlgorithm = { name: 'ECDSA', hash: { name: 'SHA-512' } }

export const headerByteAmount = 9
export const indexItemByteAmount = 45



/**
 * @param { string } relationshipName
 * @returns { string }
 */
export function getRelationshipProp (relationshipName) {
  return RELATIONSHIP_PREFIX + relationshipName
}


/**
 * @param { string } prop
 * @returns { string }
 */
export function getRelationshipNameFromProp (prop) {
  return prop.split(RELATIONSHIP_PREFIX)?.[1]
}


/**
 * @param { string } name - Node name or relationship name
 * @param { string } propKey
 * @param { string | boolean | number } propValue
 * @returns { string }
 */
export function getUniqueIndexKey (name, propKey, propValue) {
  return INDEX_UNIQUE + name + DELIMITER + propKey + DELIMITER + encodeURIComponent(String(propValue))
}


/**
 * @param { string } name - Node name or relationship name
 * @param { string } propKey
 * @returns { string }
 */
export function getSortIndexKey (name, propKey) {
  return INDEX_SORT + name + DELIMITER + propKey
}


/**
 * @param { string } nodeName
 * @returns { string }
 */
export function getNodeIdsKey (nodeName) {
  return INDEX_NODE_IDS_PREFIX + nodeName
}


/**
 * @param { string } relationshipName
 * @returns { string }
 */
export function getRelationshipIdsKey (relationshipName) {
  return INDEX_RELATIONSHIP_IDS_PREFIX + relationshipName
}


/**
 * @param { string } nodeName 
 * @param { string } relationshipName 
 * @returns { string }
 */
export function getNodeNamePlusRelationshipNameToNodePropNameMapKey (nodeName, relationshipName) {
  return nodeName + DELIMITER + relationshipName
}
