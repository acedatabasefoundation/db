import { AceError } from '../../objects/AceError.js'
import { getOne, write } from '../../util/storage.js'
import { getRelationshipIdsKey } from '../../util/variables.js'


/**
 * @param { string } relationshipName 
 * @param { string } _id 
 * @returns { Promise<void> }
 */
export async function delete_IdFromRelationshipIndex (relationshipName, _id) {
  if (!relationshipName) throw AceError('aceFn__delete_IdFromRelationshipIndex__falsyRelationshipName', `Please ensure a relationshipName is truthy when attempting delete_IdFromRelationshipIndex() this is not happening yet for the _id: ${ _id }`, { relationshipName, _id })

  const relationshipIdsKey = getRelationshipIdsKey(relationshipName)

  /** @type { (string | number)[] } */
  const relationshipIds = await getOne(relationshipIdsKey) || []

  for (let i = 0; i < relationshipIds.length; i++) {
    if (relationshipIds[i] === _id) {
      relationshipIds.splice(i, 1)
      break
    }
  }

  if (relationshipIds.length) write('update', relationshipIdsKey, relationshipIds)
  else write('delete', relationshipIdsKey)
}
