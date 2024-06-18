import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { getOne, write } from '../util/storage.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { deleteNodes } from '../ace/mutate/deleteNodes.js'
import { DELIMITER, getNodeIdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaDeleteNodes } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaDeleteNodes (reqItem, isSourceSchemaPush) {
  for (const node of reqItem.how) {
    await deleteData(node)
    deleteFromSchema(node)
  }

  doneSchemaUpdate(isSourceSchemaPush)
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
    await deleteNodes(nodeIds)
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

  delete Memory.txn.schema?.nodes?.[node]
}
