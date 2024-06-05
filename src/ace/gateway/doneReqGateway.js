import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { approachReqGateway } from './approachReqGateway.js'
import { revertAppendWal } from '../../wal/revertAppendWal.js'
import { revertEmptyFile } from '../../empty/revertEmptyFile.js'
import { revertWriteSchema } from '../../schema/revertWriteSchema.js'
import { SchemaDataStructures } from '../../objects/SchemaDataStructures.js'


/**
 * @param { { res?: td.AceFnFullResponse, error?: any, resolve?: (res: td.AceFnResponse) => void, reject?: td.AcePromiseReject, options: td.AceFnOptions } } item
 * @returns { Promise<void> }
 */
export async function doneReqGateway ({ res, error, resolve, reject, options }) {
  if (reject || res?.now?.$ace?.txnCancelled) {
    await revertWriteSchema(options)
    await revertAppendWal()
    await revertEmptyFile(options)

    Memory.wal.byteAmount -= Memory.wal.revert.byteAmount

    for (const [ key, value ] of Memory.wal.revert.map) {
      if (typeof value === 'undefined') Memory.wal.map.delete(key)
      else Memory.wal.map.set(key, value)
    }
  }

  if (res && resolve) resolve(res.now)
  else if (reject) {
    console.log('error:', error)
    reject(error) 
  }

  if (reject || Memory.txn.step === 'lastReq' || res?.now?.$ace?.txnCancelled) { // IF last request in txn
    if (Memory.txn.timeoutId) clearTimeout(Memory.txn.timeoutId)

    resetMemory()

    if (Memory.queue.length) { // if more txn's are in the queue => start the next one
      const next = Memory.queue.shift()
      if (next) await approachReqGateway(next.resolve, next.reject, next.options)
    }
  } else {
    Memory.txn.step = 'respondedAndWaiting'
  }
}


/**
 * We want to preserve some values from one txn to the next
 * Preserve txn.schema, txn.schemaDataStructures, txn.lastId, wal.byteAmount, wal.fileSize, wal.map and maybe wal.filehandle
 */
async function resetMemory () {
  Memory.txn.id = undefined
  Memory.txn.env = undefined
  Memory.txn.timeoutId = undefined
  Memory.txn.step = 'preEnter'
  Memory.txn.schema = null
  Memory.txn.schemaDataStructures = SchemaDataStructures(null)
  Memory.txn.schemaUpdated = false
  Memory.txn.schemaNowDetails = undefined
  Memory.txn.schemaOriginalDetails = undefined
  Memory.txn.hasUpdates = false
  Memory.txn.emptyTimestamp = undefined
  Memory.txn.enumGraphIdsMap.clear()
  Memory.txn.writeMap.clear()
  Memory.txn.writeStr = ''
  Memory.txn.sortIndexMap.clear()

  Memory.wal.revert = { byteAmount: 0, map: new Map() }

  if (!Memory.queue.length && Memory.wal.filehandle) {
    await Memory.wal.filehandle.close()
    Memory.wal.filehandle = undefined // in other functions, to know if the filehandle is closed, we falsy check
  }
}
