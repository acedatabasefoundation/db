import { td } from '#ace'
import { AceError } from '../../objects/AceError.js'
import { getMany, write } from '../../util/storage.js'
import { getRelationshipProp } from '../../util/variables.js'
import { deleteIdFromRelationshipProp } from './deleteIdFromRelationshipProp.js'
import { delete_IdFromRelationshipIndex } from './delete_IdFromRelationshipIndex.js'


/**
 * @param { (string | number)[] } _ids
 * @returns { Promise<void> }
 */
export async function deleteRelationshipsBy_Ids (_ids) {
  if (!Array.isArray(_ids) || !_ids.length) throw AceError('aceFn__deleteRelationshipsBy_Ids__invalidIds', 'Please ensure _ids to deleteRelationshipsBy_Ids() is a populated array, this is not happening yet for the _ids:', { _ids })

  /** @type { Map<string | number, td.AceGraphRelationship> } */
  const graphRelationships = await getMany(_ids)

  for (const entryGraphRelationship of graphRelationships) {
    await delete_IdFromRelationshipIndex(entryGraphRelationship[1].relationship, entryGraphRelationship[1].props._id)

    /** @type { Map<string | number, td.AceGraphNode> } */
    const relationshipNodes = await getMany([ entryGraphRelationship[1].props.a, entryGraphRelationship[1].props.b ])

    for (const entryRelationshipNode of relationshipNodes) {
      await deleteIdFromRelationshipProp(getRelationshipProp(entryGraphRelationship[1].relationship), entryGraphRelationship[1].props._id, entryRelationshipNode[1])
    }
  }

  for (const _id of _ids) {
    write('delete', _id) // add @ end b/c above we need info from this relationship
  }
}
