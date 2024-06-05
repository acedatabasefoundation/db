import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { getNodeIdsKey } from '../util/variables.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getMany, getOne } from '../util/storage.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateNodePropName } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateNodePropName (reqItem) {
  for (const { node, nowName, newName } of reqItem.how.props) {
    if (!Memory.txn.schema?.nodes[node]) throw AceError('aceFn__schemaUpdateNodePropName__invalidNode', `Please ensure that when updating a node prop name, the node is defined in the schema, this is not happening yet for the node: ${ node }, nowName: ${ nowName }, and newName: ${ newName }`, { node, nowName, newName })
    if (!Memory.txn.schema?.nodes[node]?.[nowName]) throw AceError('aceFn__schemaUpdateNodePropName__invalidProp', `Please ensure that when updating a node prop name, the prop is defined in the schema, this is not happening yet for the node: ${ node }, nowName: ${ nowName }, and newName: ${ newName }`, { node, nowName, newName })

    /** @type { string[] } */
    const nodeIds = await getOne(getNodeIdsKey(node))

    if (nodeIds.length) {
      /** @type { Map<string | number, td.AceGraphNode> } */
      const graphNodes = await getMany(nodeIds)

      for (const entry of graphNodes) {
        if (typeof entry[1].props[nowName] !== 'undefined') {
          entry[1].props[newName] = entry[1].props[nowName]
          delete entry[1].props[nowName]
          write('update', entry[0], entry[1])
        }
      }
    }

    // update schema
    Memory.txn.schema.nodes[node][newName] = Memory.txn.schema.nodes[node][nowName]
    delete Memory.txn.schema.nodes[node][nowName]
    doneSchemaUpdate()
  }
}
