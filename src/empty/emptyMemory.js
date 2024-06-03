import { Memory } from '../objects/Memory.js'
import { getNow } from '../util/variables.js'
import { SchemaDataStructures } from '../objects/SchemaDataStructures.js'


/** @returns { void } */
export function emptyMemory () {
  Memory.txn.schema = null
  Memory.txn.schemaDataStructures = SchemaDataStructures(null)
  Memory.txn.schemaUpdated = false
  Memory.txn.schemaNowDetails = { currentVersion: 0, lastCreatedVersion: 0 }
  Memory.txn.lastId = 0
  Memory.txn.hasUpdates = false
  Memory.txn.emptyTimestamp = getNow() // will be the name of the folder in trash
  Memory.txn.enumGraphIdsMap.clear()
  Memory.txn.writeMap.clear()
  Memory.txn.writeStr = ''
  Memory.txn.sortIndexMap.clear()

  Memory.wal.byteAmount = 0
  Memory.wal.map.clear()
}
