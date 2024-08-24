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
  for (let i = 0; i < reqItem.how.length; i++) {
    await deleteData(reqItem.how[i])
    deleteFromSchema(reqItem.how[i])
  }

  doneSchemaUpdate(isSourceSchemaPush)
}


/**
 * @param { string } relationship
 * @returns { Promise<void> }
 */
async function deleteData (relationship) {
  const relationship_IdsKey = getRelationship_IdsKey(relationship)
  const relationship_Ids =/** @type { td.AceGraphIndex | undefined } */ ( await getOne(relationship_IdsKey))

  if (Array.isArray(relationship_Ids?.index)) {
    await deleteRelationships(relationship_Ids.index)
    write({ $aA: 'delete', $aK: relationship_IdsKey })
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
