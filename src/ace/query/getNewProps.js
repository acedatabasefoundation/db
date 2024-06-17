import { td, enums } from '#ace'
import { AceError } from '../../objects/AceError.js'
import { getRelationshipNode } from './getRelationshipNode.js'


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { { [k: string]: any } } graphNode 
 * @param { td.AceQueryNewPropsGroup } newPropsGroup 
 * @returns { number | string | undefined }
 */
export function getNewProps (detailedResValueSection, graphNode, newPropsGroup) {
  const symbol = getSymbol(newPropsGroup)
  const groupItems = symbol ? newPropsGroup[symbol] : null
  const response = /** @type {*} */ ({ value: undefined, using: undefined })

  if (symbol && groupItems) {
    for (const item of groupItems) {
      if (/** @type { td.AceQueryProp } */ (item)?.prop) {
        const queryProp = /** @type { td.AceQueryProp } */ (item)

        if (!queryProp.relationships?.length) setnewPropsValueAndUsing(symbol, graphNode[queryProp.prop], response)
        else {
          const rRelationshipNode = getRelationshipNode(detailedResValueSection, graphNode, queryProp.relationships)
          if (rRelationshipNode.node?.[queryProp.prop]) setnewPropsValueAndUsing(symbol, rRelationshipNode.node[queryProp.prop], response)
        }
      } else if (/** @type { td.AceQueryNewPropsGroup } */ (item)?.add || /** @type { td.AceQueryNewPropsGroup } */ (item)?.subtract || /** @type { td.AceQueryNewPropsGroup } */ (item)?.multiply || /** @type { td.AceQueryNewPropsGroup } */ (item)?.divide) {
        const queryNewPropsGroup = /** @type { td.AceQueryNewPropsGroup } */ (item)
        const v = getNewProps(detailedResValueSection, graphNode, queryNewPropsGroup)
        setnewPropsValueAndUsing(symbol, v, response)
      } else {
        setnewPropsValueAndUsing(symbol, item, response)
      }
    }
  }

  return response.value
}


/**
 * @param { enums.queryNewPropsSymbol } symbol 
 * @param { any } newPropsValue 
 * @param { any } response 
 */
function setnewPropsValueAndUsing (symbol, newPropsValue, response) {
  if (typeof response.value === 'undefined') response.value = newPropsValue
  else if (response.using === 'string' || typeof newPropsValue === 'string') {
    response.using = response.using || 'string'
    if (symbol === 'add') response.value += newPropsValue
  } else if (typeof newPropsValue === 'number') {
    response.using = response.using || 'number'
    if (symbol === 'add') response.value += newPropsValue
    else if (symbol === 'subtract') response.value -= newPropsValue
    else if (symbol === 'multiply') response.value *= newPropsValue
    else if (symbol === 'divide') response.value /= newPropsValue
  }
}


/**
 * @param {*} newPropsGroup 
 * @returns { enums.queryNewPropsSymbol }
 */
function getSymbol (newPropsGroup) {
  /** @type { enums.queryNewPropsSymbol } */
  let symbol

  if (newPropsGroup.add) symbol = 'add'
  else if (newPropsGroup.subtract) symbol = 'subtract'
  else if (newPropsGroup.multiply) symbol = 'multiply'
  else if (newPropsGroup.divide) symbol = 'divide'
  else throw AceError('getNewProps__invalidNewPropsSymbol', 'Please include add, subtract, multiply or divide when using newProps', { current: newPropsGroup, example: { newProps: { fullName: { add: [ { prop: 'firstName' }, ' ', { prop: 'lastName' } ] } } } } )

  return symbol
}
