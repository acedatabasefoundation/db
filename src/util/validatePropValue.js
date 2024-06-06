import { enums } from '#ace'
import { AceError } from '../objects/AceError.js'


/**
 * @param { string } propName 
 * @param { any } propValue 
 * @param { enums.dataTypes } propDataType 
 * @param { string } parentName 
 * @param { 'node' | 'relationship' | 'node or relationship' } parentType 
 * @param { string } fnName 
 * @param { { [k: string]: any } } _errorData 
 * @returns { void }
 */
export function validatePropValue (propName, propValue, propDataType, parentName, parentType, fnName, _errorData) {
  if (propDataType === 'string' && typeof propValue !== 'string') throw AceError(`aceFn__${ fnName }__string`, `Please ensure the ${ parentType } name "${ parentName }" with the prop name "${ propName }" is a typeof "string" because the schema property data type is "string"`, _errorData)
  if (propDataType === 'isoString' && typeof propValue !== 'string') throw AceError(`aceFn__${ fnName }__isoString`, `Please ensure the ${ parentType } name "${ parentName }" with the prop name "${ propName }" is a typeof "string" because the schema property data type is "isoString"`, _errorData)
  if (propDataType === 'number' && typeof propValue !== 'number') throw AceError(`aceFn__${ fnName }__number`, `Please ensure the ${ parentType } name "${ parentName }" with the prop name "${ propName }" is a typeof "number" because the schema property data type is "number"`, _errorData)
  if (propDataType === 'boolean' && typeof propValue !== 'boolean') throw AceError(`aceFn__${ fnName }__boolean`, `Please ensure the ${ parentType } name "${ parentName }" with the prop name "${ propName }" is a typeof "boolean" because the schema property data type is "boolean"`, _errorData)
}
