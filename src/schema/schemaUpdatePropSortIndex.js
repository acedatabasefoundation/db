import { td } from '#ace'
import { write } from '../util/storage.js'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { getSortIndexKey } from '../util/variables.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { addToSortIndexMap } from '../ace/mutate/addToSortIndexMap.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdatePropSortIndex } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaUpdatePropSortIndex (reqItem, isSourceSchemaPush) {
  let schemaUpdated = false

  for (let i = 0; i < reqItem.how.length; i++) {
    const schemaProp = Memory.txn.schema?.nodes[reqItem.how[i].nodeOrRelationship]?.[reqItem.how[i].prop] || Memory.txn.schema?.relationships?.[reqItem.how[i].nodeOrRelationship]?.props?.[reqItem.how[i].prop]


    // validate reqItem
    if (!schemaProp) throw new AceError('schemaUpdatePropSortIndex__invalidReq', `Please ensure when attempting to update node or relationship "sortIndex", the node or relationship and prop are defined in your schema. This is not happening yet for the node or relationship: "${ reqItem.how[i].nodeOrRelationship }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: reqItem.how[i] })
    if (typeof reqItem.how[i].sortIndex !== 'boolean') throw new AceError('schemaUpdatePropSortIndex__invalidType', `Please ensure when attempting to update node or relationship "sortIndex", the typeof reqItemProp.sortIndex is "boolean". This is not happening yet for the node or relationship: "${ reqItem.how[i].nodeOrRelationship }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: reqItem.how[i] })
    if (schemaProp.is !== 'Prop' && schemaProp.is !== 'RelationshipProp') throw new AceError('schemaUpdatePropSortIndex__invalidProp', `Please ensure when attempting to node or relationship "sortIndex", schemaProp.is is "Prop" or "RelationshipProp". This is not happening yet for the node or relationship: "${ reqItem.how[i].nodeOrRelationship }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: reqItem.how[i] })

  
    if (schemaProp.options.sortIndex && !reqItem.how[i].sortIndex) {
      // remove from schema
      schemaUpdated = true
      delete schemaProp.options.sortIndex

      // remove from graph
      const key = getSortIndexKey(reqItem.how[i].nodeOrRelationship, reqItem.how[i].prop)
      write({ $aA: 'delete', $aK: key })

      // remove from sortIndexMap
      Memory.txn.sortIndexMap.delete(key)
    } else if (!schemaProp.options.sortIndex && reqItem.how[i].sortIndex) {
      // add to schema
      schemaUpdated = true
      schemaProp.options.sortIndex = true

      // add to sortIndexMap (which will later add to graph)
      addToSortIndexMap(schemaProp, reqItem.how[i].nodeOrRelationship, reqItem.how[i].prop)
    }
  }

  if (schemaUpdated) doneSchemaUpdate(isSourceSchemaPush)
}
