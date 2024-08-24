import { td } from '#ace'
import { Txn } from './Txn.js'
import { Collator } from './Collator.js'
import { getNow } from '../util/variables.js'
import { SchemaDetail } from './SchemaDetail.js'
import { SchemaDataStructures } from './SchemaDataStructures.js'


/** @type { td.AceMemory } */
export const Memory = {
  queue: [],
  txn: Txn(),
  collator: Collator(),
  aol: { array: [], nowFileSize: null, ogFileSize: null },
}


/** @returns { Promise<void> } */
export async function doneReqGatewayReset () { // Preserve some values from one txn to the next. Order is based on typedefs.js
  Memory.txn.id = undefined
  Memory.txn.env = undefined
  Memory.txn.timeoutId = undefined
  Memory.txn.step = 'preEnter'
  // preserve Memory.txn.schema
  // preserve Memory.txn.schemaDataStructures
  Memory.txn.schemaUpdated = undefined
  Memory.txn.schemaPushRequested = undefined
  Memory.txn.schemaPushRequestedThenSchemaUpdated = undefined
  // preserve Memory.txn.schemaNowDetails
  // preserve Memory.txn.schemaOriginalDetails
  // preserve Memory.txn.lastGraphId
  Memory.txn.hasUpdates = undefined
  Memory.txn.emptyTimestamp = undefined
  Memory.txn.enumGraphIds = new Map()
  Memory.txn.writeArray = []
  Memory.txn.sortIndexMap.clear()

  if (!Memory.queue.length) { // preserve filehandles if there are more requests in queue
    if (Memory.aol.filehandle) {
      await Memory.aol.filehandle.close()
      Memory.aol.filehandle = undefined // in other functions, to know if the filehandle is closed, we falsy check
    }
  }

  // preserve Memory.queue

  Memory.aol.ogFileSize = Memory.aol.nowFileSize // sync these up
  // preserve Memory.aol.nowFileSize
  // preserve Memory.aol.array

  // preserve Memory.collator
}


/**
 * When ace() is called with a do: "Empty".
 * This is just clearing memory, not files.
 * @returns { Promise<void> }
 */
export async function onEmpty () { // Order is based on typedefs.js
  // preserve Memory.txn.id
  // preserve Memory.txn.env
  // preserve Memory.txn.timeoutId
  // preserve Memory.txn.step
  Memory.txn.schema = null
  Memory.txn.schemaDataStructures = SchemaDataStructures(null)
  Memory.txn.schemaUpdated = undefined
  Memory.txn.schemaPushRequested = undefined
  Memory.txn.schemaPushRequestedThenSchemaUpdated = undefined

  if (Memory.txn.env && Memory.txn.schemaNowDetails) {
    Memory.txn.schemaNowDetails[Memory.txn.env] = SchemaDetail()
  }

  // preserve Memory.txn.schemaOriginalDetails
  Memory.txn.lastGraphId = 0
  Memory.txn.hasUpdates = undefined
  Memory.txn.emptyTimestamp = getNow() // will be the name of the folder in trash
  Memory.txn.enumGraphIds = new Map()
  Memory.txn.writeArray = []
  Memory.txn.sortIndexMap.clear()

  // preserve Memory.queue

  // preserve Memory.aol.fileSize (set to 0 @ emptyFile.js)
  Memory.aol.array = []

  if (Memory.aol.filehandle) {
    await Memory.aol.filehandle.close()
    Memory.aol.filehandle = undefined // in other functions, to know if the filehandle is closed, we falsy check
  }

  // preserve Memory.queue

  // preserve Memory.aol.ogFileSize
  // preserve Memory.aol.nowFileSize

  // preserve Memory.collator
}
