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
    res.now.$ace.txnId = Memory.txn.id
  } else if (options.txn?.id) {
    Memory.txn.id = options.txn.id
    res.now.$ace.txnId = Memory.txn.id
  }
}
