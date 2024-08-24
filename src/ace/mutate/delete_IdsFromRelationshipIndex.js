import { td } from '#ace'
import { AceError } from '../../objects/AceError.js'
import { write, getOne } from '../../util/storage.js'
import { getRelationship_IdsKey } from '../../util/variables.js'


/**
 * @param { string } relationshipName 
 * @param { Set<string | number> } _ids 
 * @returns { Promise<void> }
 */
export async function delete_IdsFromRelationshipIndex (relationshipName, _ids) {
  if (!relationshipName) throw new AceError('delete_IdsFromRelationshipIndex__falsyRelationshipName', `Please ensure a relationshipName is truthy when attempting delete_IdsFromRelationshipIndex() this is not happening yet for the _id: ${ _ids }`, { relationshipName, _id: _ids })

  let deletedCount = 0
  const relationship_IdsKey = getRelationship_IdsKey(relationshipName)
  const relationship_Ids =/** @type { td.AceGraphIndex | undefined } */ ( await getOne(relationship_IdsKey))

  if (Array.isArray(relationship_Ids?.index)) {
    for (let i = relationship_Ids.index.length - 1; i >= 0; i--) {
      if (_ids.has(relationship_Ids.index[i])) {
        relationship_Ids.index.splice(i, 1)
        deletedCount++

        if (deletedCount === _ids.size) break // if all deleted => can stop looping
      }
    }

    if (relationship_Ids?.index.length) write({ $aA: 'update', $aK: relationship_IdsKey, index: relationship_Ids.index })
    else write({ $aA: 'delete', $aK: relationship_IdsKey })
  }
}
