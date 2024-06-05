import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { doneReqGateway } from '../gateway/doneReqGateway.js'


/**
 * @param { td.AcePromiseReject } reject 
 * @param { td.AceFnOptions } options 
 * @returns { void }
 */
export function setTxnTimer (reject, options) {
  if (Memory.txn.id && !Memory.txn.timeoutId && options.txn?.do === 'Start') {
    const seconds = (options.txn.maxSeconds || 9)

    Memory.txn.timeoutId = setTimeout(async () => {
      try {
        await doneReqGateway({ options, reject, error: `Please ensure each transaction takes a maximum of ${ seconds } seconds to resolve, this limit was reached for the transaction id: ${ Memory.txn.id }` })
      } catch (e) {
        console.log('error', e)
      }
    }, seconds * 1000)
  }
}
