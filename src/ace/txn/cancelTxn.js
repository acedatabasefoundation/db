import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'


/**
 * @param { td.AceFnFullResponse } res 
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @param { (params: td.AceFnDoneReqGatewayParams) => td.AceFnDoneReqGatewayResponse } doneReqGateway 
 * @returns { Promise<void> }
 */
export async function cancelTxn (res, resolve, doneReqGateway) {
  if (!Memory.txn.id) throw new AceError('cancelTxn__falsyTxnId', 'Please ensure Memory.txn.id is truthy', {})

  if (!res.now.$ace && Memory.txn.id) res.now.$ace = { txnId: Memory.txn.id, txnCancelled: true }
  else res.now.$ace.txnCancelled = true

  await doneReqGateway({ res, resolve })
}
