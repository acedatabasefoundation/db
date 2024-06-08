import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { getSortIndexKey } from '../../util/variables.js'


/**
 * @param { td.AceSchemaProp | td.AceSchemaRelationshipProp } schemaProp 
 * @param { string } nodeOrRelationshipName 
 * @param { string } propName 
 * @param { string | number }[ graphId ]
 */
export function addToSortIndexMap (schemaProp, nodeOrRelationshipName, propName, graphId) {
  if (schemaProp.options.sortIndex) {
    const key = getSortIndexKey(nodeOrRelationshipName, propName)
    const value = Memory.txn.sortIndexMap.get(key) || { schemaProp, nodeOrRelationshipName, propName, newIds: [] }

    if (typeof graphId !== 'undefined') value.newIds.push(graphId)
    Memory.txn.sortIndexMap.set(key, value)
  }
}
