import { td } from '#ace'
import { AceError } from '../../objects/AceError.js'
import { write, getMany } from '../../util/storage.js'
import { delete_IdFromRelationshipProp } from './delete_IdFromRelationshipProp.js'
import { delete_IdsFromRelationshipIndex } from './delete_IdsFromRelationshipIndex.js'


/**
 * @param { (string | number)[] } _ids
 * @returns { Promise<void> }
 */
export async function deleteRelationships (_ids) {
  if (!Array.isArray(_ids) || !_ids.length) throw new AceError('deleteRelationships__invalidIds', 'Please ensure _ids to deleteRelationships() is a populated array, this is not happening yet for the _ids:', { _ids })

  const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(_ids))

  /** @type { Map<string, Set<string | number>>} Map<relationshipName, _ids> Group _ids by relationship*/
  const byRelationship = new Map()

  for (let i = 0; i < graphRelationships.length; i++) {
    const set = byRelationship.get(graphRelationships[i].relationship) || new Set()
    set.add(graphRelationships[i].$aK)
    byRelationship.set(graphRelationships[i].relationship, set)

    const relationshipNodes = /** @type { td.AceGraphNode[] } */ (await getMany([ graphRelationships[i].a, graphRelationships[i].b ]))

    for (let j = 0; j < relationshipNodes.length; j++) {
      delete_IdFromRelationshipProp(graphRelationships[i].relationship, graphRelationships[i].$aK, relationshipNodes[j])
    }
  }

  for (const entry of byRelationship) {
    await delete_IdsFromRelationshipIndex(entry[0], entry[1])
  }

  for (let i = 0; i < _ids.length; i++) {
    write({ $aA: 'delete', $aK: _ids[i] }) // add @ end b/c above we need info from this relationship
  }
}
