import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { isObjectPopulated } from '../util/isObjectPopulated.js'


/**
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnOptions } options 
 * @returns { void } 
 */
export function set$ace (res, options) {
  if (Memory.txn.enumGraphIds.size) {
    if (!res.now.$ace) res.now.$ace = { enumIds: {} }
    if (!res.now.$ace.enumIds) res.now.$ace.enumIds = {}

    for (const entry of Memory.txn.enumGraphIds) {
      res.now.$ace.enumIds[entry[0]] = entry[1]
    }
  }

  if (Memory.txn.writeArray.length) {
    for (let i = 0; i < Memory.txn.writeArray.length; i++) {
      if (Memory.txn.writeArray[i].$aA === 'delete') {
        if (!res.now.$ace) res.now.$ace = { deletedKeys: [ Memory.txn.writeArray[i].$aK ] }
        else if (!res.now.$ace.deletedKeys) res.now.$ace.deletedKeys = [ Memory.txn.writeArray[i].$aK ]
        else res.now.$ace.deletedKeys.push(Memory.txn.writeArray[i].$aK)
      }
    }
  }

  switch (options.txn?.do) {
    case 'Start':
      if (!res.now.$ace) res.now.$ace = { txnStarted: true }
      else res.now.$ace.txnStarted = true
      break
    case 'Complete':
      if (!res.now.$ace) res.now.$ace = { txnCompleted: true }
      else res.now.$ace.txnCompleted = true
      break
    case 'Cancel':
      if (!res.now.$ace) res.now.$ace = { txnCancelled: true }
      else res.now.$ace.txnCancelled = true
      break
  }
}
