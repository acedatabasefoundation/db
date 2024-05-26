import { enums } from '#ace'
import { memory } from '../memory/memory.js'


/**
 * @param { enums.writeActions } action 
 * @param { string | number } key 
 * @param { any } [ value ]
 * @returns { void }
 */
export function write (action, key, value) {
  memory.txn.writeMap.set(key, { value, action })
  memory.txn.writeStr += (JSON.stringify([ key, action, value ]) + '\n')
}


/**
 * Undefined if not found
 * @param { string | number } key
 * @returns { Promise<any> }
 */
export async function getOne (key) {
  let res

  if (key) {
    const item = memory.txn.writeMap.get(key) || memory.wal.map.get(key)
    if (item && item?.action !== 'delete') res = item.value
  }

  return res
}


/**
 * map.get(key) is undefined if not found
 * @param { (string | number)[] } keys
 * @returns { Promise<Map<(string | number), any>> }
 */
export async function getMany (keys) {
  /** @type { Map<string | number, any> } */
  const res = new Map()

  for (const key of keys) {
    const value = await getOne(key)
    if (value) res.set(key, value)
  }

  return res
}
