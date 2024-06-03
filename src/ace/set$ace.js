import { td } from '#ace'
import { Memory } from '../objects/Memory.js'


/**
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnOptions } options 
 * @returns { void } 
 */
export function set$ace (res, options) {
  if (Memory.txn.enumGraphIdsMap.size) {
    if (!res.now.$ace) res.now.$ace = { enumIds: {} }
    if (!res.now.$ace.enumIds) res.now.$ace.enumIds = {}

    for (const entry of Memory.txn.enumGraphIdsMap) {
      res.now.$ace.enumIds[entry[0]] = entry[1]
    }
  }

  if (Memory.txn.writeMap.size) {
    for (const entry of Memory.txn.writeMap) {
      if (entry[1].do === 'delete') {
        if (!res.now.$ace) res.now.$ace = { deletedKeys: [ entry[0] ] }
        else if (!res.now.$ace.deletedKeys) res.now.$ace.deletedKeys = [ entry[0] ]
        else res.now.$ace.deletedKeys.push(entry[0])
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
