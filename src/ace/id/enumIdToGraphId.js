import { Memory } from '../../objects/Memory.js'
import { ENUM_ID_PREFIX } from '../../util/variables.js'



/**
 * @param { { id?: any, ids?: any[] } } options 
 */
export function enumIdToGraphId (options) {
  if (options.id) return _enumIdToGraphId(options.id)
  else if (options.ids) {
    const newIds = []

    for (let id of options.ids) {
      newIds.push(_enumIdToGraphId(id))
    }

    return newIds
  }
}


/**
 * @param { any } id 
 * @returns { any }
 */
function _enumIdToGraphId (id) {
  return (typeof id === 'string' && id.startsWith(ENUM_ID_PREFIX)) ? Memory.txn.enumGraphIdsMap.get(id) : id
}
