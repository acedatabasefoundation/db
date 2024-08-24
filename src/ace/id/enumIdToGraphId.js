import { vars } from '../../util/variables.js'
import { Memory } from '../../objects/Memory.js'



/**
 * @param { { id?: any, ids?: any[] } } options 
 */
export function enumIdToGraphId (options) {
  if (options.id) return _enumIdToGraphId(options.id)
  else if (options.ids) {
    const newIds = []

    for (let i = 0; i < options.ids.length; i++) {
      newIds.push(_enumIdToGraphId(options.ids[i]))
    }

    return newIds
  }
}


/**
 * @param { any } id 
 * @returns { any }
 */
function _enumIdToGraphId (id) {
  return (typeof id === 'string' && id.startsWith(vars.enumIdPrefix)) ? Memory.txn.enumGraphIds.get(id) : id
}
