import { td } from '#ace'
import { Txn } from './Txn.js'


/** @type { td.AceMemory } */
export const Memory = {
  queue: [],
  txn: Txn(),
  wal: {
    byteAmount: 0,
    map: new Map(),
    revert: { byteAmount: 0, map: new Map() }
  },
}
