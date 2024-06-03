import { Memory } from '../../objects/Memory.js'
import { write, getOne } from '../../util/storage.js'
import { LAST_ID_KEY } from '../../util/variables.js'


/** @returns { Promise<number> } */
export async function getGraphId () {
  if (!Memory.txn.lastId) Memory.txn.lastId = Number(await getOne(LAST_ID_KEY)) || 0

  Memory.txn.lastId++

  write('upsert', LAST_ID_KEY, Memory.txn.lastId)

  return Memory.txn.lastId
}
