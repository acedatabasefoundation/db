import { td } from '#ace'


/**
 * @param { td.AceFnFullResponse } res 
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @param { (params: td.AceFnDoneReqGatewayParams) => td.AceFnDoneReqGatewayResponse } doneReqGateway 
 * @returns { Promise<void> }
 */
export async function cancelTxn (res, resolve, doneReqGateway) {
  res.now.$ace.txnCancelled = true
  await doneReqGateway({ res, resolve })
}
