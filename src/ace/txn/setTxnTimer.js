import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { doneReqGateway } from '../gateway/doneReqGateway.js'


/**
 * @param { td.AcePromiseReject } reject 
 * @param { td.AceFnOptions } options 
 * @returns { void }
 */
export function setTxnTimer (reject, options) {
  if (Memory.txn.id && !Memory.txn.timeoutId) {
    Memory.txn.timeoutId = setTimeout(async () => {
      try {
        await doneReqGateway({ options, reject, error: `Please ensure each transaction takes a maximum of 9 seconds to resolve, this limit was reached for the transaction id: ${ Memory.txn.id }` })
      } catch (e) {
        console.log('error', e)
      }
    }, 9_000)
  }
}
