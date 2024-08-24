import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { void }
 */
export function setTxnEnv (options) {
  if (!options.env || typeof options.env !== 'string') throw new AceError('setTxnEnv__missingEnv', 'Please ensure options.env is a truthy string when calling ace()', {})
  if (Memory.txn.env && Memory.txn.env !== options.env) throw new AceError('setTxnEnv__alignEnv', 'Please ensure options.env is the same for each request in this transaction', { txnEnv: Memory.txn.env, optionsEnv: Memory.txn.env })
  if (!Memory.txn.env) Memory.txn.env = options.env
}
