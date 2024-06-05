import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { getNodeIdsKey } from '../util/variables.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { getMany, getOne, write } from '../util/storage.js'


/** 
 * @param { td.AceMutateRequestItemSchemaDeleteNodeProps } reqItem
 * @returns { Promise<void> }
 */
export async function schemaDeleteNodeProps (reqItem) {
  for (const { node, prop } of reqItem.how.props) {
    if (!Memory.txn.schema?.nodes[node]?.[prop]) throw AceError('aceFn__schemaDeleteNodeProps__invalidNodePropCombo', `Pleae ensure that when you'd love to delete a prop, the node and prop align, this is not happening yet with node: ${ node } and prop: ${ prop } for the reqItem:`, { reqItem, node, prop })
    if (/** @type {*} */ (prop) === 'id') throw AceError('aceFn__schemaDeleteNodeProps__invalidId', `Pleae ensure that when you'd love to delete a prop, the prop is not id, this is not happening yet for the reqItem:`, { reqItem, node, prop })

    const nodeIdsKey = getNodeIdsKey(node)

    /** @type { (string | number)[] } */
    const nodeIds = await getOne(nodeIdsKey)

    if (nodeIds.length) {
      /** @type { Map<string|number, td.AceGraphNode> } */
      const graphNodes = await getMany(nodeIds)

      for (const entry of graphNodes) {
        if (typeof entry[1].props[prop] !== 'undefined') {
          delete entry[1].props[prop]
          write('update', entry[0], entry[1])
        }
      }
    }

    delete Memory.txn.schema.nodes[node][prop]
    doneSchemaUpdate()
  }
}