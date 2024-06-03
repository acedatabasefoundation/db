import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { aceDoUpdateSet } from '../enums/aceDo.js'


/**
 * @param { td.AceFnRequestItem[] } req
 * @returns { Promise<void> }
 */
export async function setHasUpdates (req) {
  if (!Memory.txn.hasUpdates) Memory.txn.hasUpdates = Boolean(req.find(reqItem => aceDoUpdateSet.has(reqItem.do)))
}
