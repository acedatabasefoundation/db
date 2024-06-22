import { Memory } from '../../objects/Memory.js'
import { write, getOne } from '../../util/storage.js'
import { LAST_ID_KEY } from '../../util/variables.js'


/** @returns { Promise<number> } */
export async function getGraphId () {
  if (!Memory.txn.lastGraphId) Memory.txn.lastGraphId = Number(await getOne(LAST_ID_KEY)) || 0

  Memory.txn.lastGraphId++

  write('upsert', LAST_ID_KEY, Memory.txn.lastGraphId)

  return Memory.txn.lastGraphId
}
