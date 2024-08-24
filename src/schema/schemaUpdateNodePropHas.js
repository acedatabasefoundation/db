import { td, enums } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateNodePropHas } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaUpdateNodePropHas (reqItem, isSourceSchemaPush) {
  for (let i = 0; i < reqItem.how.length; i++) {
    const schemaProp = Memory.txn.schema?.nodes[reqItem.how[i].node]?.[reqItem.how[i].prop]


    // validate reqItem
    if (!schemaProp) throw new AceError('schemaUpdateNodePropHas__invalidNodePropCombo', `Please ensure when attempting to update node prop has, the node and prop are defined in your schema. This is not happening yet for the node: ${ reqItem.how[i].node } and prop: ${ reqItem.how[i].prop }`, { reqItemProp: { node: reqItem.how[i].node, prop: reqItem.how[i].prop, has: reqItem.how[i].has } })
    if (schemaProp.is === 'Prop') throw new AceError('schemaUpdateNodePropHas__invalidProp', `Please ensure when attempting to update node prop has, the prop does not have an "is" in your schema of "Prop". This is not happening yet for the node: ${ reqItem.how[i].node } and prop: ${ reqItem.how[i].prop }`, { reqItemProp: { node: reqItem.how[i].node, prop: reqItem.how[i].prop, has: reqItem.how[i].has } })
    if (!enums.schemaHas[reqItem.how[i].has]) throw new AceError('schemaUpdateNodePropHas__invalidHas', `Please ensure when attempting to update node prop "has", that the "has" is either "one" or "many". This is not happening yet for the node: ${ reqItem.how[i].node }, prop: ${ reqItem.how[i].prop } and has: ${ reqItem.how[i].has }`, { reqItemProp: { node: reqItem.how[i].node, prop: reqItem.how[i].prop, has: reqItem.how[i].has } })


    // update schema (no data update required b/c relationships are stored as an array in the graph wheter one or many)
    schemaProp.options.has = reqItem.how[i].has
  }

  doneSchemaUpdate(isSourceSchemaPush)
}
