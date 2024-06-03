import { enums } from '#ace'
import { Memory } from '../objects/Memory.js'


/**
 * @param { enums.writeDo } todo
 * @param { string | number } key 
 * @param { any } [ value ]
 * @returns { void }
 */
export function write(todo, key, value) {
  Memory.txn.writeMap.set(key, { value, do: todo })
  Memory.txn.writeStr += (JSON.stringify([ key, todo, value ]) + '\n')
}


/**
 * Undefined if not found
 * @param { string | number } key
 * @returns { Promise<any> }
 */
export async function getOne (key) {
  let res

  if (key) {
    const item = Memory.txn.writeMap.get(key) || Memory.wal.map.get(key)
    if (item && item?.do !== 'delete') res = item.value
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
