import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateNodePropCascade } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateNodePropCascade (reqItem) {
  for (const { node, prop, cascade } of reqItem.how.props) {
    const schemaProp = Memory.txn.schema?.nodes[node]?.[prop]


    // validate reqItem
    if (!schemaProp) throw AceError('aceFn__schemaUpdateNodePropCascade__invalidNodePropCombo', `Please ensure when attempting to update node prop cascade, the node and prop are defined in your schema. This is not happening yet for the node: "${ node }" and prop: "${ prop }"`, { reqItemProp: { node, prop, cascade } })
    if (schemaProp.is === 'Prop') throw AceError('aceFn__schemaUpdateNodePropCascade__invalidProp', `Please ensure when attempting to update node prop cascade, the prop does not have an "is" in your schema of "Prop". This is not happening yet for the node: "${ node }" and prop: "${ prop }"`, { reqItemProp: { node, prop, cascade } })
    if (typeof cascade !== 'boolean') throw AceError('aceFn__schemaUpdateNodePropCascade__invalidCascade', `Please ensure when attempting to update node prop "cascade", that the "cascade" is typeof "boolean". This is not happening yet for the node: "${ node }", prop: "${ prop }" and cascade typeof: "${ typeof cascade }"`, { reqItemProp: { node, prop, cascade } })


    // update schema (no data update required b/c this value is only used to determine what to do when deleting nodes)
    schemaProp.options.cascade = cascade
  }

  doneSchemaUpdate()
}
