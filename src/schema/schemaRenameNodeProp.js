import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { getNodeIdsKey } from '../util/variables.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'


/** 
 * @param { td.AceMutateRequestItemSchemaRenameNodeProp } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaRenameNodeProp (reqItem, isSourceSchemaPush) {
  for (const { node, nowName, newName } of reqItem.how) {
    if (!Memory.txn.schema?.nodes[node]) throw AceError('schemaRenameNodeProp__invalidNode', `Please ensure that when updating a node prop name, the node is defined in the schema, this is not happening yet for the node: ${ node }, nowName: ${ nowName }, and newName: ${ newName }`, { node, nowName, newName })
    if (!Memory.txn.schema?.nodes[node]?.[nowName]) throw AceError('schemaRenameNodeProp__invalidProp', `Please ensure that when updating a node prop name, the prop is defined in the schema, this is not happening yet for the node: ${ node }, nowName: ${ nowName }, and newName: ${ newName }`, { node, nowName, newName })

    /** @type { string[] } */
    const nodeIds = await getOne(getNodeIdsKey(node))

    if (nodeIds?.length) {
      /** @type {td.AceGraphNode[] } */
      const graphNodes = await getMany(nodeIds)

      for (const graphNode of graphNodes) {
        if (typeof graphNode.props[nowName] !== 'undefined') {
          graphNode.props[newName] = graphNode.props[nowName]
          delete graphNode.props[nowName]
          write('update', graphNode.props.id, graphNode)
        }
      }
    }

    // update schema
    Memory.txn.schema.nodes[node][newName] = Memory.txn.schema.nodes[node][nowName]
    delete Memory.txn.schema.nodes[node][nowName]
    doneSchemaUpdate(isSourceSchemaPush)
  }
}
