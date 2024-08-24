import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'


/**
 * @param { td.AceMutateRequestItemNodeInsertProps | td.AceMutateRequestItemNodeUpdateProps } props
 * @param { string | number } reqItemKey
 * @returns { void }
 */
export function overwriteIds (props, reqItemKey) {
  const reqItemValue = props[reqItemKey]
  const graphId = Memory.txn.enumGraphIds.get(reqItemValue)

  if (graphId) props[reqItemKey] = graphId
  else throw new AceError('mutate__invalidId', `Please ensure each enumId that is used is defined on a node, this is not happening yet for the enumId: ${ reqItemValue }`, { enumId: reqItemValue })
}
