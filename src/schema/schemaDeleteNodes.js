import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { getOne, write } from '../util/storage.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { deleteNodes } from '../ace/mutate/deleteNodes.js'
import { delimiter, getNodeIdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaDeleteNodes } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaDeleteNodes (reqItem, isSourceSchemaPush) {
  for (let i = 0; i < reqItem.how.length; i++) {
    await deleteData(reqItem.how[i])
    deleteFromSchema(reqItem.how[i])
  }

  doneSchemaUpdate(isSourceSchemaPush)
}


/**
 * @param { string } node
 * @returns { Promise<void> }
 */
async function deleteData (node) {
  const nodeIdsKey = getNodeIdsKey(node)
  const nodeIds = /** @type { td.AceGraphIndex | undefined } */ (await getOne(nodeIdsKey))

  if (Array.isArray(nodeIds?.index)) {
    await deleteNodes(nodeIds.index)
    write({ $aA: 'delete', $aK: nodeIdsKey })
  }
}


/**
 * @param { string } node
 * @returns { void }
 */
function deleteFromSchema (node) {
  const nodeRelationshipPropsMap = Memory.txn.schemaDataStructures.nodeRelationshipPropsMap.get(node)

  if (nodeRelationshipPropsMap) {
    for (const entry of nodeRelationshipPropsMap) {
      delete Memory.txn.schema?.relationships?.[entry[1].relationship]
      delete Memory.txn.schema?.nodes[entry[1].node][entry[1].prop]
    }
  }

  delete Memory.txn.schema?.nodes?.[node]
}
