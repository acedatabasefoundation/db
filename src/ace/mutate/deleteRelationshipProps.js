import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { write, getMany } from '../../util/storage.js'


/**
 * @param { td.AceMutateRequestItemRelationshipPropDelete } reqItem
 * @returns { Promise<void> }
 */
export async function deleteRelationshipProps (reqItem) {
  if (!Array.isArray(reqItem?.how?._ids) || !reqItem.how._ids.length) throw new AceError('deleteRelationshipProps__invalid_Ids', 'Please ensure reqItem.how.props._ids to deleteRelationshipProps() is an array of ids, this is not happening yet for the reqItem:', { reqItem })
  if (!Array.isArray(reqItem?.how?.props) || !reqItem.how.props.length) throw new AceError('deleteRelationshipProps__invalidProps', 'Please ensure reqItem.how.props to deleteRelationshipProps() is an array of pupulated string props, this is not happening yet for the reqItem:', { reqItem })

  const props = new Set(reqItem.how.props)

  if (props.has('_id')) throw new AceError('deleteRelationshipProps__invalidProp__id', 'Please ensure reqItem.how.props to deleteRelationshipProps() does not include _id, this is not happening yet for the reqItem:', { props: reqItem.how.props })
  if (props.has('a')) throw new AceError('deleteRelationshipProps__invalidProp__a', 'Please ensure reqItem.how.props to deleteRelationshipProps() does not include a, this is not happening yet for the reqItem:', { props: reqItem.how.props })
  if (props.has('b')) throw new AceError('deleteRelationshipProps__invalidProp__b', 'Please ensure reqItem.how.props to deleteRelationshipProps() does not include b, this is not happening yet for the reqItem:', { props: reqItem.how.props })

  const relationshipNodes = /** @type { td.AceGraphRelationship[] } */ (await getMany(reqItem.how._ids))

  for (let i = 0; i < relationshipNodes.length; i++) {
    for (let j = 0; j < reqItem.how.props.length; j++) {
      if (typeof relationshipNodes[i][reqItem.how.props[j]] !== 'undefined') {
        if (!Memory.txn.schema?.relationships?.[relationshipNodes[i].relationship]?.props?.[reqItem.how.props[i]]) throw new AceError('deleteRelationshipProps__invalidRelationshipPropCombo', `Please ensure when deleting relationship props that the relationship and prop combination is defined in the schema. This is not happening yet for the relationship name: "${ relationshipNodes[i].props.relationship }" and the prop name: "${ reqItem.how.props[j] }"`, { relationship: relationshipNodes[i].props.relationship, prop: reqItem.how.props[j] })

        delete relationshipNodes[i][reqItem.how.props[j]]
        relationshipNodes[i].$aA = 'update'
        write(relationshipNodes[i])
      }
    }
  }
}
