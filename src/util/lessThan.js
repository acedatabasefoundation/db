import { Memory } from '../objects/Memory.js'


/**
 * @param { string | number } v1 
 * @param { string | number } v2 
 * @returns { boolean }
 */
export function lessThan (v1, v2) {
  if (typeof v1 === 'number' && typeof v2 === 'number') return v1 < v2
  else if (typeof v1 === 'string' && typeof v2 === 'string') return Memory.collator.compare(v1, v2) === -1
  else if (typeof v1 === 'number' && typeof v2 === 'string') return true
  else return false // (typeof v1 === 'string' && typeof v2 === 'number')
}
