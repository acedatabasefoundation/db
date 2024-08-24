import { td } from '#ace'
import { write } from '../../util/storage.js'
import { lastIdKey } from '../../util/variables.js'
import { approachReqGateway } from './approachReqGateway.js'
import { revertEmptyFile } from '../../empty/revertEmptyFile.js'
import { revertAppendToAol } from '../../aol/revertAppendToAol.js'
import { revertWriteSchema } from '../../schema/revertWriteSchema.js'
import { Memory, doneReqGatewayReset } from '../../objects/Memory.js'
import { binarySearchAdd, binarySearchSub } from '../../util/binarySearch.js'


/** @type { td.AceFnDoneReqGateway } */
export async function doneReqGateway ({ res, error, resolve, reject }) {
  if (reject || res?.now?.$ace?.txnCancelled) {
    await revertWriteSchema()
    await revertAppendToAol()
    await revertEmptyFile()
    if (typeof Memory.txn.startGraphId === 'number') write({ $aA: 'upsert', $aK: lastIdKey, value: Memory.txn.startGraphId })

    for (let i = 0; i < Memory.txn.writeArray.length; i++) {
      if (Memory.txn.writeArray[i].$aA === 'delete') binarySearchAdd(Memory.aol.array, Memory.txn.writeArray[i]) // we deleted from aol, then the txn was cancelled, so now add back
      else binarySearchSub(Memory.aol.array, Memory.txn.writeArray[i].$aK) // we added to aol, then the txn was cancelled, so now remove
    }
  }

  if (res && resolve) resolve(res.now)
  else if (reject) reject(error) 

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
