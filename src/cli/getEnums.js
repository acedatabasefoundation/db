import { aceDo } from '../enums/aceDo.js'
import { dataTypes } from '../enums/dataTypes.js'
import { jwkTypes } from '../enums/jwkTypes.js'
import { queryNewPropsSymbol } from '../enums/queryNewPropsSymbol.js'
import { queryOptions, postQueryOptions } from '../enums/queryOptions.js'
import { queryWhereGroupSymbol } from '../enums/queryWhereGroupSymbol.js'
import { queryWhereSymbol } from '../enums/queryWhereSymbol.js'
import { schemaHas } from '../enums/schemaHas.js'
import { schemaIs } from '../enums/schemaIs.js'
import { sortHow } from '../enums/sortHow.js'
import { txnDo } from '../enums/txnDo.js'
import { txnSteps } from '../enums/txnSteps.js'
import { writeDo } from '../enums/writeDo.js'



/** @returns {Map<string, Map<string, string> | Set<string>>} */
function setEnumsMap () {
  const enumsMap = new Map()

  enumsMap.set('aceDo', aceDo)
  enumsMap.set('dataTypes', dataTypes)
  enumsMap.set('jwkTypes', jwkTypes)
  enumsMap.set('queryNewPropsSymbol', queryNewPropsSymbol)
  enumsMap.set('queryOptions', queryOptions)
  enumsMap.set('postQueryOptions', postQueryOptions)
  enumsMap.set('queryWhereGroupSymbol', queryWhereGroupSymbol)
  enumsMap.set('queryWhereSymbol', queryWhereSymbol)
  enumsMap.set('schemaHas', schemaHas)
  enumsMap.set('schemaIs', schemaIs)
  enumsMap.set('sortHow', sortHow)
  enumsMap.set('txnDo', txnDo)
  enumsMap.set('txnSteps', txnSteps)
  enumsMap.set('writeDo', writeDo)

  return enumsMap
}


/**
 * Generate the code for .ace/enums.js
 * @returns { string }
 */
export function getEnums () {
  let result = ''

  const enumsMap = setEnumsMap()

  /**
   * @param { string } enumStr 
   * @param { string } a 
   * @param { string } b 
   */
  const getKeyAndValue = (enumStr, a, b) => {
    if (enumStr === 'dataTypes' || enumStr === 'aceDo') return { key: b, value: b }
    else return { key: b, value: a }
  }

  enumsMap.forEach((enumDataStructure, enumStr) => {
    if (!enumDataStructure.size) {
      result += `\n/** @typedef { string } ${ enumStr } */
export const ${ enumStr } =  ''\n\n\n`
    } else {
      result += `/** @typedef {`

      let typedef = ''
      let enumProps = ''

      enumDataStructure.forEach((a, b) => {
        const { key, value } = getKeyAndValue(enumStr, a, b)
        typedef += ` '${ key }' |`
        enumProps += `  ${ key }: /** @type { '${ value }' } */ ('${ value }'),\n`
      })

      result += typedef
      result = result.slice(0, -1) // remove trailing pipe
      result += `} ${ enumStr } */\nexport const ${ enumStr } = {\n`
      result += enumProps
      result += '}\n\n\n'
    }
  })

  return result.trim()
}
