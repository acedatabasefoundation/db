import { td } from '#ace'
import { lessThan } from './lessThan.js'


/**
 * @param { td.AceGraphItem[] } array 
 * @param { string | number } key 
 * @returns { td.AceGraphItem | undefined }
 */
export function binarySearchGet (array, key) {
  const index = binarySearch(array, key)
  if (index < array.length && array[index].$aK === key) return array[index] // key found, return the object
  else return undefined // key not found, return undefined
}


/**
 * @param { td.AceGraphItem[] } array
 * @param { td.AceGraphItem } obj
 * @returns { void }
 */ 
export function binarySearchAdd (array, obj) {
  const index = binarySearch(array, obj.$aK)

  if (index < array.length && array[index].$aK === obj.$aK) array[index] = obj // key found, update the object at this index
  else array.splice(index, 0, obj) // key not found, insert the object at the correct index
}


/**
 * @param { any[] } array
 * @param { string | number } key
 * @returns { void }
 */ 
export function binarySearchSub (array, key) {
  const index = binarySearch(array, key)

  if (index < array.length && array[index].$aK === key) array.splice(index, 1) // key found, delete the object at this index
}


/**
 * @param { any[] } array
 * @param { string | number } key
 * @returns { number }
 */
function binarySearch (array, key) {
  let leftIndex = 0
  let rightIndex = array.length - 1

  while (leftIndex <= rightIndex) {
    const middleIndex = (leftIndex + rightIndex) >>> 1; // Use bitwise shift for faster integer division, same as: Math.floor((leftIndex + rightIndex) / 2)

    if (array[middleIndex].$aK === key) return middleIndex // key found, return index
    else if (lessThan(array[middleIndex].$aK, key)) leftIndex = middleIndex + 1
    else rightIndex = middleIndex - 1
  }

  return leftIndex // key not found, return insertion point
}
