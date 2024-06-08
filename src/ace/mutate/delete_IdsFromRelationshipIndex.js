import { AceError } from '../../objects/AceError.js'
import { write, getOne } from '../../util/storage.js'
import { getRelationshipIdsKey } from '../../util/variables.js'


/**
 * @param { string } relationshipName 
 * @param { Set<string | number> } _ids 
 * @returns { Promise<void> }
 */
export async function delete_IdsFromRelationshipIndex (relationshipName, _ids) {
  if (!relationshipName) throw AceError('aceFn__delete_IdsFromRelationshipIndex__falsyRelationshipName', `Please ensure a relationshipName is truthy when attempting delete_IdsFromRelationshipIndex() this is not happening yet for the _id: ${ _ids }`, { relationshipName, _id: _ids })

  let deletedCount = 0
  const relationshipIdsKey = getRelationshipIdsKey(relationshipName)

  /** @type { (string | number)[] } */
  const relationshipIds = await getOne(relationshipIdsKey) || []

  if (relationshipIds.length) {
    for (let i = relationshipIds.length - 1; i >= 0; i--) {
      if (_ids.has(relationshipIds[i])) {
        relationshipIds.splice(i, 1)
        deletedCount++

        if (deletedCount === _ids.size) break // if all deleted => can stop looping
      }
    }
  }

  if (relationshipIds.length) write('update', relationshipIdsKey, relationshipIds)
  else write('delete', relationshipIdsKey)
}
