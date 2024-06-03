import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { getNow } from '../../util/variables.js'


/**
 * @param { string } itemName 
 * @param { td.AceMutateRequestItemNodeInsertProps | td.AceMutateRequestItemNodeUpdateProps | td.AceMutateRequestItemRelationshipInsertProps | td.AceMutateRequestItemRelationshipUpdateProps } [ props ] 
 * @returns { void }
 */
export function applyDefaults (itemName, props) {
  if (props) {
    const defaults = Memory.txn.schemaDataStructures.defaults.get(itemName)

    if (defaults) {
      for (const d of defaults) {
        if (typeof props[d.prop] === 'undefined') {
          if (d.do === 'setIsoNow') props[d.prop] = getNow()
          else if (typeof d.value !== 'undefined') props[d.prop] = d.value
        }
      }
    }
  }
}
