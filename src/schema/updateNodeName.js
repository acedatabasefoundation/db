import { td } from '#ace'
import { doneUpdate } from './doneUpdate.js'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { write, getMany, getOne } from '../util/storage.js'
import { DELIMITER, getNodeIdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateNodeName } reqItem
 * @returns { Promise<void> }
 */
export async function updateNodeName (reqItem) {
  for (const { nowName, newName } of reqItem.how.nodes) {
    if (!Memory.txn.schema?.nodes[nowName]) throw AceError('aceFn__updateNodeName__invalidNowName', `Please ensure each nowName is defined in the schema, this is not happening yet for the nowName: ${ nowName } @ the reqItem:`, { reqItem, nowName, newName })


    // update node on each graphNode
    const nodeIdsKey = getNodeIdsKey(nowName)

    /** @type { string[] } */
    const nodeIds = await getOne(nodeIdsKey)

    if (nodeIds.length) {
      /** @type { Map<string | number, td.AceGraphNode> } */
      const graphNodes = await getMany(nodeIds)

      for (const entry of graphNodes) {
        entry[1].node = newName
        write('update', entry[0], entry[1])
      }
    }


    // update nodeIdsKey
    const newNodeIdsKey = getNodeIdsKey(newName)
    write('update', newNodeIdsKey, nodeIds)
    write('delete', nodeIdsKey)


    // update node name in the schema props options
    const nodeRelationshipPropsSet = Memory.txn.schemaDataStructures.nodeRelationshipPropsMap.get(nowName)

    if (nodeRelationshipPropsSet) {
      for (const pointer of nodeRelationshipPropsSet) {
        const split = pointer.split(DELIMITER)
        const options = /** @type { td.AceSchemaNodeRelationshipOptions } */(Memory.txn.schema.nodes[split[0]][split[1]].options)

        options.node = newName 
      }
    }


    // update node name @ schem.nodes
    Memory.txn.schema.nodes[newName] = Memory.txn.schema.nodes[nowName]
    delete Memory.txn.schema.nodes[nowName]

    doneUpdate()
  }
}
