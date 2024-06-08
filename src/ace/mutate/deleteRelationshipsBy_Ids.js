import { td } from '#ace'
import { AceError } from '../../objects/AceError.js'
import { write, getMany } from '../../util/storage.js'
import { getRelationshipProp } from '../../util/variables.js'
import { delete_IdFromRelationshipProp } from './delete_IdFromRelationshipProp.js'
import { delete_IdsFromRelationshipIndex } from './delete_IdsFromRelationshipIndex.js'


/**
 * @param { (string | number)[] } _ids
 * @returns { Promise<void> }
 */
export async function deleteRelationshipsBy_Ids (_ids) {
  if (!Array.isArray(_ids) || !_ids.length) throw AceError('aceFn__deleteRelationshipsBy_Ids__invalidIds', 'Please ensure _ids to deleteRelationshipsBy_Ids() is a populated array, this is not happening yet for the _ids:', { _ids })

  /** @type { td.AceGraphRelationship[] } */
  const graphRelationships = await getMany(_ids)

  /** @type { Map<string, Set<string | number>>} Map<relationshipName, _ids> Group _ids by relationship*/
  const byRelationship = new Map()

  for (const graphRelationship of graphRelationships) {
    const set = byRelationship.get(graphRelationship.relationship) || new Set()
    set.add(graphRelationship.props._id)
    byRelationship.set(graphRelationship.relationship, set)

    /** @type { td.AceGraphNode[] } */
    const relationshipNodes = await getMany([ graphRelationship.props.a, graphRelationship.props.b ])

    for (const relationshipNode of relationshipNodes) {
      delete_IdFromRelationshipProp(getRelationshipProp(graphRelationship.relationship), graphRelationship.props._id, relationshipNode)
    }
  }

  for (const entry of byRelationship) {
    await delete_IdsFromRelationshipIndex(entry[0], entry[1])
  }

  for (const _id of _ids) {
    write('delete', _id) // add @ end b/c above we need info from this relationship
  }
}
