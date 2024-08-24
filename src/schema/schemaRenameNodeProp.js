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
  for (let i = 0; i < reqItem.how.length; i++) {
    if (!Memory.txn.schema?.nodes[reqItem.how[i].node]) throw new AceError('schemaRenameNodeProp__invalidNode', `Please ensure that when updating a node prop name, the node is defined in the schema, this is not happening yet for the node: ${ reqItem.how[i].node }, nowName: ${ reqItem.how[i].nowName }, and newName: ${ reqItem.how[i].newName }`, { node: reqItem.how[i].node, nowName: reqItem.how[i].nowName, newName: reqItem.how[i].newName })
    if (!Memory.txn.schema?.nodes[reqItem.how[i].node]?.[reqItem.how[i].nowName]) throw new AceError('schemaRenameNodeProp__invalidProp', `Please ensure that when updating a node prop name, the prop is defined in the schema, this is not happening yet for the node: ${ reqItem.how[i].node }, nowName: ${ reqItem.how[i].nowName }, and newName: ${ reqItem.how[i].newName }`, { node: reqItem.how[i].node, nowName: reqItem.how[i].nowName, newName: reqItem.how[i].newName })

    const nodeIds = /** @type { td.AceGraphIndex | undefined } */ (await getOne(getNodeIdsKey(reqItem.how[i].node)))

    if (Array.isArray(nodeIds?.index)) {
      const graphNodes = /** @type { td.AceGraphNode[] } */ (await getMany(nodeIds.index))

      for (let j = 0; j < graphNodes.length; j++) {
        if (typeof graphNodes[j][reqItem.how[i].nowName] !== 'undefined') {
          graphNodes[j][reqItem.how[i].newName] = graphNodes[j][reqItem.how[i].nowName]
          delete graphNodes[j][reqItem.how[i].nowName]
          graphNodes[j].$aA = 'update'
          write(graphNodes[j])
        }
      }
    }

    // update schema
    Memory.txn.schema.nodes[reqItem.how[i].node][reqItem.how[i].newName] = Memory.txn.schema.nodes[reqItem.how[i].node][reqItem.how[i].nowName]
    delete Memory.txn.schema.nodes[reqItem.how[i].node][reqItem.how[i].nowName]
    doneSchemaUpdate(isSourceSchemaPush)
  }
}
