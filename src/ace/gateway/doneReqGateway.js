import { td } from '#ace'
import { approachReqGateway } from './approachReqGateway.js'
import { revertAppendWal } from '../../wal/revertAppendWal.js'
import { revertEmptyFile } from '../../empty/revertEmptyFile.js'
import { revertWriteSchema } from '../../schema/revertWriteSchema.js'
import { Memory, doneReqGatewayReset } from '../../objects/Memory.js'


/**
 * @param { { res?: td.AceFnFullResponse, error?: any, resolve?: (res: td.AceFnResponse) => void, reject?: td.AcePromiseReject, options: td.AceFnOptions } } item
 * @returns { Promise<void> }
 */
export async function doneReqGateway ({ res, error, resolve, reject, options }) {
  if (reject || res?.now?.$ace?.txnCancelled) {
    await revertWriteSchema(options)
    await revertAppendWal()
    await revertEmptyFile(options)

    Memory.wal.byteAmount -= Memory.txn.revertWalDetails.byteAmount

    for (const [ key, value ] of Memory.txn.revertWalDetails.map) {
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

    await doneReqGatewayReset()

    if (Memory.queue.length) { // if more txn's are in the queue => start the next one
      const next = Memory.queue.shift()
      if (next) await approachReqGateway(next.resolve, next.reject, next.options)
    }
  } else {
    Memory.txn.step = 'respondedAndWaiting'
  }
}
