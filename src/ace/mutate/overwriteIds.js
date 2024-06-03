import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { ENUM_ID_PREFIX } from '../../util/variables.js'


/**
 * @param { td.AceMutateRequestItemNodeInsertProps | td.AceMutateRequestItemNodeUpdateProps } props
 * @param { string | number } reqItemKey
 * @returns { void }
 */
export function overwriteIds (props, reqItemKey) {
  const reqItemValue = props[reqItemKey]

  if (typeof reqItemValue === 'string' && reqItemValue.startsWith(ENUM_ID_PREFIX)) {
    const graphId = Memory.txn.enumGraphIdsMap.get(reqItemValue)

    if (graphId) props[reqItemKey] = graphId
    else throw AceError('aceFn__mutate__invalidId', `Please ensure each enumId that is used is defined on a node, this is not happening yet for the enumId: ${ reqItemValue }`, { enumId: reqItemValue })
  }
}
