import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { enterReqGateway } from './enterReqGateway.js'


/**
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @param { td.AcePromiseReject } reject 
 * @param { td.AceFnOptions } options 
 * @param { (params: td.AceFnDoneReqGatewayParams) => td.AceFnDoneReqGatewayResponse } doneReqGateway 
 * @returns { Promise<void> }
 */
export async function approachReqGateway (resolve, reject, options, doneReqGateway) {
  if (Memory.txn.step === 'preEnter' || options.txn?.id === Memory.txn.id) await enterReqGateway(resolve, reject, options, doneReqGateway) // IF no txn is in progress OR this request has a txnId that matches the txn in progress
  else Memory.queue.push({ resolve, reject, options })
}
