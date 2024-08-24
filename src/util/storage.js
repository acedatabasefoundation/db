import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { binarySearchGet, binarySearchAdd } from './binarySearch.js'


/**
 * @param { td.AceGraphItem } graphItem
 * @returns { void }
 */
export function write (graphItem) {
  binarySearchAdd(Memory.txn.writeArray, graphItem)
}


/**
 * If not found, response is undefined
 * @param { string | number } key
 * @returns { Promise<undefined | td.AceGraphItem> }
 */
export async function getOne (key) {
  let res

  if (key) {
    const graphItem =
      binarySearchGet(Memory.txn.writeArray, key) ||
      binarySearchGet(Memory.aol.array, key)

    if (graphItem && graphItem.$aA !== 'delete') res = graphItem
  }

  return res
}


/**
 * If undefined in graph, not in response array.
 * @param { (string | number)[] } keys
 * @returns { Promise<td.AceGraphItem[]> }
 */
export async function getMany (keys) {
  /** @type { td.AceGraphItem[] } */
  const res = []

  for (let i = 0; i < keys.length; i++) {
    const value = await getOne(keys[i])

    if (value) res.push(value)
  }

  return res
}
