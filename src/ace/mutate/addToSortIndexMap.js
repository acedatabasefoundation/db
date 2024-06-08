import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { getSortIndexKey } from '../../util/variables.js'


/**
 * @param { string | number } graphId 
 * @param { td.AceSchemaProp | td.AceSchemaRelationshipProp } schemaProp 
 * @param { string } nodeOrRelationshipName 
 * @param { string } propName 
 */
export function addToSortIndexMap (graphId, schemaProp, nodeOrRelationshipName, propName) {
  if (schemaProp.options.sortIndex) {
    const key = getSortIndexKey(nodeOrRelationshipName, propName)
    const value = Memory.txn.sortIndexMap.get(key) || { propName, newIds: [] }

    value.newIds.push(graphId)
    Memory.txn.sortIndexMap.set(key, value)
  }
}
