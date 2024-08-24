import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { getNodeIdsKey } from '../util/variables.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'


/** 
 * @param { td.AceMutateRequestItemSchemaRenameNode } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaRenameNode (reqItem, isSourceSchemaPush) {
  for (let i = 0; i < reqItem.how.length; i++) {
    if (!Memory.txn.schema?.nodes[reqItem.how[i].nowName]) throw new AceError('schemaRenameNode__invalidNowName', `Please ensure each nowName is defined in the schema, this is not happening yet for the nowName: ${ reqItem.how[i].nowName } @ the reqItem:`, { reqItem, nowName: reqItem.how[i].nowName, newName: reqItem.how[i].newName })

    // update node on each graphNode
    const nodeIdsKey = getNodeIdsKey(reqItem.how[i].nowName)
    const nodeIds = /** @type { td.AceGraphIndex | undefined } */ (await getOne(nodeIdsKey))

    if (Array.isArray(nodeIds?.index)) {
      const graphNodes = /** @type { (td.AceGraphNode)[] } */ (await getMany(nodeIds.index))

      for (let j = 0; j < graphNodes.length; i++) {
        graphNodes[j].$aN = reqItem.how[i].newName
        graphNodes[j].$aA = 'update'
        write(graphNodes[j])
      }

      // update nodeIdsKey
      const newNodeIdsKey = getNodeIdsKey(reqItem.how[i].newName)
      write({ $aA: 'insert', $aK: newNodeIdsKey, index: nodeIds.index })
      write({ $aA: 'delete', $aK: nodeIdsKey })
    }



    // update node name in the schema props options
    const nodeRelationshipPropsMap = Memory.txn.schemaDataStructures.nodeRelationshipPropsMap.get(reqItem.how[i].nowName)

    if (nodeRelationshipPropsMap) {
      for (const entry of nodeRelationshipPropsMap) {
        const options = /** @type { td.AceSchemaNodeRelationshipOptions } */(Memory.txn.schema.nodes[entry[1].node][entry[1].prop].options)

        options.node = reqItem.how[i].newName 
      }
    }


    // update node name @ schem.nodes
    Memory.txn.schema.nodes[reqItem.how[i].newName] = Memory.txn.schema.nodes[reqItem.how[i].nowName]
    delete Memory.txn.schema.nodes[reqItem.how[i].nowName]

    doneSchemaUpdate(isSourceSchemaPush)
  }
}
