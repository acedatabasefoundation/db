import { td } from '#ace'
import { Txn } from '../objects/Txn.js'


/**
 * @type { td.AceMemory }
 */
export const memory = {
  queue: [],
  txn: Txn(),
  wal: {
    miniIndex: [],
    byteAmount: 0,
    map: new Map(),
  },
}
