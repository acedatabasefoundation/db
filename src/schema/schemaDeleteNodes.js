import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { getOne, write } from '../util/storage.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { DELIMITER, getNodeIdsKey } from '../util/variables.js'
import { deleteNodesById } from '../ace/mutate/deleteNodesById.js'


/** 
 * @param { td.AceMutateRequestItemSchemaDeleteNodes } reqItem
 * @returns { Promise<void> }
 */
export async function schemaDeleteNodes (reqItem) {
  for (const node of reqItem.how.nodes) {
    await deleteData(node)
    deleteFromSchema(node)
  }

  doneSchemaUpdate()
}


/**
 * @param { string } node
 * @returns { Promise<void> }
 */
async function deleteData (node) {
  const nodeIdsKey = getNodeIdsKey(node)

  /** @type { (string | number)[] } */
  const nodeIds = await getOne(nodeIdsKey)

  if (nodeIds?.length) {
    await deleteNodesById(nodeIds)
    write('delete', nodeIdsKey)
  }
}


/**
 * @param { string } node
 * @returns { void }
 */
function deleteFromSchema (node) {
  const nodeRelationshipPropsSet = Memory.txn.schemaDataStructures.nodeRelationshipPropsMap.get(node)

  if (nodeRelationshipPropsSet) {
    for (const pointer of nodeRelationshipPropsSet) {
      const split = pointer.split(DELIMITER)

      delete Memory.txn.schema?.relationships?.[split[2]]
      delete Memory.txn.schema?.nodes[split[0]][split[1]]
    }
  }
}
