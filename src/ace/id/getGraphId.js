import { getOne } from '../../util/storage.js'
import { Memory } from '../../objects/Memory.js'
import { lastIdKey } from '../../util/variables.js'


/** @returns { Promise<number> } */
export async function getGraphId () {
  if (!Memory.txn.lastGraphId) Memory.txn.lastGraphId = Memory.txn.startGraphId = Number(await getOne(lastIdKey)) || 0

  Memory.txn.lastGraphId++
  return Memory.txn.lastGraphId
}
