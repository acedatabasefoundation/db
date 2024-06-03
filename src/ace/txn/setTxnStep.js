import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { void }
 */
export function setTxnStep (options) {
  switch (Memory.txn.step) {
    case 'preEnter':
      if (options.txn?.do === 'Start') Memory.txn.step = 'notLastReq'
      else if (options.txn?.do === 'Complete') Memory.txn.step = 'lastReq'
      else if (options.txn?.id) Memory.txn.step = 'notLastReq'
      else Memory.txn.step = 'lastReq'
      break
    case 'respondedAndWaiting':
    case 'notLastReq':
      if (options.txn?.do === 'Complete') Memory.txn.step = 'lastReq'
      else Memory.txn.step = 'notLastReq'
      break
  }
}
