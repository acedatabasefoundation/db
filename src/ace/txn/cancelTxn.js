import { td } from '#ace'
import { doneReqGateway } from '../gateway/doneReqGateway.js'


/**
 * @param { td.AceFnFullResponse } res 
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function cancelTxn (res, resolve, options) {
  if (!res.now.$ace) res.now.$ace = { txnCancelled: true }
  else res.now.$ace.txnCancelled = true

  await doneReqGateway({ res, resolve, options })
}
