import { td } from '#ace'
import { write } from '../util/storage.js'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { getSortIndexKey } from '../util/variables.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { addToSortIndexMap } from '../ace/mutate/addToSortIndexMap.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdatePropSortIndex } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdatePropSortIndex (reqItem) {
  let schemaUpdated = false

  for (const prop of reqItem.how.props) {
    const schemaProp = Memory.txn.schema?.nodes[prop.nodeOrRelationship]?.[prop.prop] || Memory.txn.schema?.relationships?.[prop.nodeOrRelationship]?.props?.[prop.prop]


    // validate reqItem
    if (!schemaProp) throw AceError('aceFn__schemaUpdatePropSortIndex__invalidReq', `Please ensure when attempting to update node or relationship "sortIndex", the node or relationship and prop are defined in your schema. This is not happening yet for the node or relationship: "${ prop.nodeOrRelationship }" and prop: "${ prop.prop }"`, { reqItemProp: prop })
    if (typeof prop.sortIndex !== 'boolean') throw AceError('aceFn__schemaUpdatePropSortIndex__invalidType', `Please ensure when attempting to update node or relationship "sortIndex", the typeof reqItemProp.sortIndex is "boolean". This is not happening yet for the node or relationship: "${ prop.nodeOrRelationship }" and prop: "${ prop.prop }"`, { reqItemProp: prop })
    if (schemaProp.is !== 'Prop' && schemaProp.is !== 'RelationshipProp') throw AceError('aceFn__schemaUpdatePropSortIndex__invalidProp', `Please ensure when attempting to node or relationship "sortIndex", schemaProp.is is "Prop" or "RelationshipProp". This is not happening yet for the node or relationship: "${ prop.nodeOrRelationship }" and prop: "${ prop.prop }"`, { reqItemProp: prop })

  
    if (schemaProp.options.sortIndex && !prop.sortIndex) {
      // remove from schema
      schemaUpdated = true
      delete schemaProp.options.sortIndex

      // remove from graph
      const key = getSortIndexKey(prop.nodeOrRelationship, prop.prop)
      write('delete', key)

      // remove from sortIndexMap
      Memory.txn.sortIndexMap.delete(key)
    } else if (!schemaProp.options.sortIndex && prop.sortIndex) {
      // add to schema
      schemaUpdated = true
      schemaProp.options.sortIndex = true

      // add to sortIndexMap (which will later add to graph)
      addToSortIndexMap(schemaProp, prop.nodeOrRelationship, prop.prop)
    }
  }

  if (schemaUpdated) doneSchemaUpdate()
}
