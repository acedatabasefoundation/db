import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { getNodeIdsKey } from '../util/variables.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'


/** 
 * @param { td.AceMutateRequestItemSchemaDeleteNodeProps } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaDeleteNodeProps (reqItem, isSourceSchemaPush) {
  for (let i = 0; i < reqItem.how.length; i++) {
    if (!Memory.txn.schema?.nodes[reqItem.how[i].node]?.[reqItem.how[i].prop]) throw new AceError('schemaDeleteNodeProps__invalidNodePropCombo', `Pleae ensure that when you'd love to delete a prop, the node and prop align, this is not happening yet with node: ${ reqItem.how[i].node } and prop: ${ reqItem.how[i].prop } for the reqItem:`, { reqItem, node: reqItem.how[i].node, prop: reqItem.how[i].prop });
    if (/** @type {*} */ (reqItem.how[i].prop) === 'id') throw new AceError('schemaDeleteNodeProps__invalidId', `Pleae ensure that when you'd love to delete a prop, the prop is not id, this is not happening yet for the reqItem:`, { reqItem, node: reqItem.how[i].node, prop: reqItem.how[i].prop });

    const nodeIds = /** @type { td.AceGraphIndex | undefined } */ (await getOne(getNodeIdsKey(reqItem.how[i].node)))

    if (Array.isArray(nodeIds?.index)) {
      const graphNodes = /** @type { td.AceGraphNode[] } */ (await getMany(nodeIds.index));

      for (let j = 0; j < graphNodes.length; j++) {
        if (typeof graphNodes[j][reqItem.how[i].prop] !== 'undefined') {
          delete graphNodes[j][reqItem.how[i].prop]
          graphNodes[j].$aA = 'update'
          write(graphNodes[j])
        }
      }
    }

    delete Memory.txn.schema.nodes[reqItem.how[i].node][reqItem.how[i].prop]
    doneSchemaUpdate(isSourceSchemaPush)
  }
}
