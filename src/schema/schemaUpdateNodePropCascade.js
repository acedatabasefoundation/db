import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateNodePropCascade } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaUpdateNodePropCascade (reqItem, isSourceSchemaPush) {
  for (let i = 0; i < reqItem.how.length; i++) {
    const schemaProp = Memory.txn.schema?.nodes[reqItem.how[i].node]?.[reqItem.how[i].prop]


    // validate reqItem
    if (!schemaProp) throw new AceError('schemaUpdateNodePropCascade__invalidNodePropCombo', `Please ensure when attempting to update node prop cascade, the node and prop are defined in your schema. This is not happening yet for the node: "${ reqItem.how[i].node }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: { node: reqItem.how[i].node, prop: reqItem.how[i].prop, cascade: reqItem.how[i].cascade } })
    if (schemaProp.is === 'Prop') throw new AceError('schemaUpdateNodePropCascade__invalidProp', `Please ensure when attempting to update node prop cascade, the prop does not have an "is" in your schema of "Prop". This is not happening yet for the node: "${ reqItem.how[i].node }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: { node: reqItem.how[i].node, prop: reqItem.how[i].prop, cascade: reqItem.how[i].cascade } })
    if (typeof reqItem.how[i].cascade !== 'boolean') throw new AceError('schemaUpdateNodePropCascade__invalidCascade', `Please ensure when attempting to update node prop "cascade", that the "cascade" is typeof "boolean". This is not happening yet for the node: "${ reqItem.how[i].node }", prop: "${ reqItem.how[i].prop }" and cascade typeof: "${ typeof reqItem.how[i].cascade }"`, { reqItemProp: { node: reqItem.how[i].node, prop: reqItem.how[i].prop, cascade: reqItem.how[i].cascade } })


    // update schema (no data update required b/c this value is only used to determine what to do when deleting nodes)
    schemaProp.options.cascade = reqItem.how[i].cascade
  }

  doneSchemaUpdate(isSourceSchemaPush)
}
