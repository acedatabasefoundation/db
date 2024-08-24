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
      for (let i = 0; i <  defaults.length; i++) {
        if (typeof props[defaults[i].prop] === 'undefined') {
          if (defaults[i].do === 'setIsoNow') props[defaults[i].prop] = getNow()
          else if (typeof defaults[i].value !== 'undefined') props[defaults[i].prop] = defaults[i].value
        }
      }
    }
  }
}
