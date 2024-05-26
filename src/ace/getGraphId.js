import { memory } from '../memory/memory.js'
import { write, getOne } from './storage.js'
import { LAST_ID_KEY } from '../util/variables.js'


/** @returns { Promise<number> } */
export async function getGraphId () {
  if (!memory.txn.lastId) memory.txn.lastId = Number(await getOne(LAST_ID_KEY)) || 0

  memory.txn.lastId++

  write('upsert', LAST_ID_KEY, memory.txn.lastId)

  return memory.txn.lastId
}
