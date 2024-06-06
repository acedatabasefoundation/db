import { td, enums } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateNodePropHas } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateNodePropHas (reqItem) {
  for (const { node, prop, has } of reqItem.how.props) {
    const schemaProp = Memory.txn.schema?.nodes[node]?.[prop]


    // validate reqItem
    if (!schemaProp) throw AceError('aceFn__schemaUpdateNodePropHas__invalidNodePropCombo', `Please ensure when attempting to update node prop has, the node and prop are defined in your schema. This is not happening yet for the node: ${ node } and prop: ${ prop }`, { reqItem })
    if (schemaProp.is === 'Prop') throw AceError('aceFn__schemaUpdateNodePropHas__invalidProp', `Please ensure when attempting to update node prop has, the prop does not have an "is" in your schema of "Prop". This is not happening yet for the node: ${ node } and prop: ${ prop }`, { reqItem })
    if (!enums.schemaHas[has]) throw AceError('aceFn__schemaUpdateNodePropHas__invalidHas', `Please ensure when attempting to update node prop "has", that the "has" is either "one" or "many". This is not happening yet for the node: ${ node }, prop: ${ prop } and has: ${ has }`, { reqItem })


    // update schema (no data update required b/c relationships are stored as an array in the graph wheter one or many)
    schemaProp.options.has = has
    doneSchemaUpdate()
  }
}
