import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'
import { DELIMITER, getNodeIdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateNodeName } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateNodeName (reqItem) {
  for (const { nowName, newName } of reqItem.how.nodes) {
    if (!Memory.txn.schema?.nodes[nowName]) throw AceError('aceFn__schemaUpdateNodeName__invalidNowName', `Please ensure each nowName is defined in the schema, this is not happening yet for the nowName: ${ nowName } @ the reqItem:`, { reqItem, nowName, newName })


    // update node on each graphNode
    const nodeIdsKey = getNodeIdsKey(nowName)

    /** @type { string[] } */
    const nodeIds = await getOne(nodeIdsKey)

    if (nodeIds.length) {
      /** @type { td.AceGraphNode[] } */
      const graphNodes = await getMany(nodeIds)

      for (const graphNode of graphNodes) {
        graphNode.node = newName
        write('update', graphNode.props.id, graphNode)
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

    doneSchemaUpdate()
  }
}
