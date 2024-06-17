import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { getOne, write } from '../util/storage.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { getRelationship_IdsKey } from '../util/variables.js'
import { deleteRelationships } from '../ace/mutate/deleteRelationships.js'


/** 
 * @param { td.AceMutateRequestItemSchemaDeleteRelationships } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaDeleteRelationships (reqItem, isSourceSchemaPush) {
  for (const node of reqItem.how) {
    await deleteData(node)
    deleteFromSchema(node)
  }

  doneSchemaUpdate(isSourceSchemaPush)
}


/**
 * @param { string } relationship
 * @returns { Promise<void> }
 */
async function deleteData (relationship) {
  const relationship_IdsKey = getRelationship_IdsKey(relationship)

  /** @type { (string | number)[] } */
  const relationship_Ids = await getOne(relationship_IdsKey)

  if (relationship_Ids?.length) {
    await deleteRelationships(relationship_Ids)
    write('delete', relationship_IdsKey)
  }
}


/**
 * @param { string } relationship
 * @returns { void }
 */
function deleteFromSchema (relationship) {
  const map = Memory.txn.schemaDataStructures.relationshipPropsMap.get(relationship)

  if (map) {
    for (const entry of map) {
      delete Memory.txn.schema?.nodes?.[entry[1].propNode]?.[entry[0]]
    }
  }

  delete Memory.txn.schema?.relationships?.[relationship]
}
