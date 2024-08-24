import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { doneReqGateway } from '../gateway/doneReqGateway.js'


/**
 * @param { td.AceFnFullResponse } res 
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @returns { Promise<void> }
 */
export async function cancelTxn (res, resolve) {
  if (!Memory.txn.id) throw new AceError('cancelTxn__falsyTxnId', 'Please ensure Memory.txn.id is truthy', {})

  if (!res.now.$ace && Memory.txn.id) res.now.$ace = { txnId: Memory.txn.id, txnCancelled: true }
  else res.now.$ace.txnCancelled = true

  await doneReqGateway({ res, resolve })
}
