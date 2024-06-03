import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'


/**
 * @param { td.AceFnOptions } options 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
export function setTxnId (options, res) {
  if (options.txn?.do === 'Start') {
    Memory.txn.id = crypto.randomUUID()

    if (!res.now.$ace) res.now.$ace = { txnId: Memory.txn.id }
    else res.now.$ace.txnId = Memory.txn.id
  } else if (options.txn?.id) {
    Memory.txn.id = options.txn.id

    if (!res.now.$ace) res.now.$ace = { txnId: Memory.txn.id }
    else res.now.$ace.txnId = Memory.txn.id
  }
}
