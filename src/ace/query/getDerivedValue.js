import { td, enums } from '#ace'
import { AceError } from '../../objects/AceError.js'
import { getRelationshipNode } from './getRelationshipNode.js'


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { { [k: string]: any } } graphNode 
 * @param { td.AceQueryDerivedGroup } derivedGroup 
 * @returns { number | string | undefined }
 */
export function getDerivedValue (detailedResValueSection, graphNode, derivedGroup) {
  const symbol = getSymbol(derivedGroup)
  const groupItems = symbol ? derivedGroup[symbol] : null
  const response = /** @type {*} */ ({ value: undefined, using: undefined })

  if (symbol && groupItems) {
    for (const item of groupItems) {
      if (/** @type { td.AceQueryProp } */ (item)?.prop) {
        const queryProp = /** @type { td.AceQueryProp } */ (item)

        if (!queryProp.relationships?.length) setDerivedValueAndUsing(symbol, graphNode[queryProp.prop], response)
        else {
          const rRelationshipNode = getRelationshipNode(detailedResValueSection, graphNode, queryProp.relationships)
          if (rRelationshipNode.node?.[queryProp.prop]) setDerivedValueAndUsing(symbol, rRelationshipNode.node[queryProp.prop], response)
        }
      } else if (/** @type { td.AceQueryDerivedGroup } */ (item)?.add || /** @type { td.AceQueryDerivedGroup } */ (item)?.subtract || /** @type { td.AceQueryDerivedGroup } */ (item)?.multiply || /** @type { td.AceQueryDerivedGroup } */ (item)?.divide) {
        const queryDerivedGroup = /** @type { td.AceQueryDerivedGroup } */ (item)
        const v = getDerivedValue(detailedResValueSection, graphNode, queryDerivedGroup)
        setDerivedValueAndUsing(symbol, v, response)
      } else {
        setDerivedValueAndUsing(symbol, item, response)
      }
    }
  }

  return response.value
}


/**
 * @param { enums.queryDerivedSymbol } symbol 
 * @param { any } derivedValue 
 * @param { any } response 
 */
function setDerivedValueAndUsing (symbol, derivedValue, response) {
  if (typeof response.value === 'undefined') response.value = derivedValue
  else if (response.using === 'string' || typeof derivedValue === 'string') {
    response.using = response.using || 'string'
    if (symbol === 'add') response.value += derivedValue
  } else if (typeof derivedValue === 'number') {
    response.using = response.using || 'number'
    if (symbol === 'add') response.value += derivedValue
    else if (symbol === 'subtract') response.value -= derivedValue
    else if (symbol === 'multiply') response.value *= derivedValue
    else if (symbol === 'divide') response.value /= derivedValue
  }
}


/**
 * @param {*} derivedGroup 
 * @returns { enums.queryDerivedSymbol }
 */
function getSymbol (derivedGroup) {
  /** @type { enums.queryDerivedSymbol } */
  let symbol

  if (derivedGroup.add) symbol = 'add'
  else if (derivedGroup.subtract) symbol = 'subtract'
  else if (derivedGroup.multiply) symbol = 'multiply'
  else if (derivedGroup.divide) symbol = 'divide'
  else throw AceError('aceFn__invalidNewPropsSymbol', 'Please include add, subtract, multiply or divide when using newProps', { current: derivedGroup, example: { newProps: { fullName: { add: [ { prop: 'firstName' }, ' ', { prop: 'lastName' } ] } } } } )

  return symbol
}
