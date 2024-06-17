import { AceError } from '../../objects/AceError.js'
import { write, getOne } from '../../util/storage.js'
import { getRelationship_IdsKey } from '../../util/variables.js'


/**
 * @param { string } relationshipName 
 * @param { Set<string | number> } _ids 
 * @returns { Promise<void> }
 */
export async function delete_IdsFromRelationshipIndex (relationshipName, _ids) {
  if (!relationshipName) throw AceError('delete_IdsFromRelationshipIndex__falsyRelationshipName', `Please ensure a relationshipName is truthy when attempting delete_IdsFromRelationshipIndex() this is not happening yet for the _id: ${ _ids }`, { relationshipName, _id: _ids })

  let deletedCount = 0
  const relationship_IdsKey = getRelationship_IdsKey(relationshipName)

  /** @type { (string | number)[] } */
  const relationship_Ids = await getOne(relationship_IdsKey) || []

  if (relationship_Ids.length) {
    for (let i = relationship_Ids.length - 1; i >= 0; i--) {
      if (_ids.has(relationship_Ids[i])) {
        relationship_Ids.splice(i, 1)
        deletedCount++

        if (deletedCount === _ids.size) break // if all deleted => can stop looping
      }
    }
  }

  if (relationship_Ids.length) write('update', relationship_IdsKey, relationship_Ids)
  else write('delete', relationship_IdsKey)
}
