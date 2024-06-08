import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { write, getMany } from '../../util/storage.js'


/**
 * @param { td.AceMutateRequestItemRelationshipPropDelete } reqItem
 * @returns { Promise<void> }
 */
export async function deleteRelationshipPropsById (reqItem) {
  if (!Array.isArray(reqItem?.how?._ids) || !reqItem.how._ids.length) throw AceError('aceFn__deleteRelationshipPropsById__invalid_Ids', 'Please ensure reqItem.how.props._ids to deleteRelationshipPropsById() is an array of ids, this is not happening yet for the reqItem:', { reqItem })
  if (!Array.isArray(reqItem?.how?.props) || !reqItem.how.props.length) throw AceError('aceFn__deleteRelationshipPropsById__invalidProps', 'Please ensure reqItem.how.props to deleteRelationshipPropsById() is an array of pupulated string props, this is not happening yet for the reqItem:', { reqItem })

  const props = new Set(reqItem.how.props)

  if (props.has('_id')) throw AceError('aceFn__deleteRelationshipPropsById__invalidProp__id', 'Please ensure reqItem.how.props to deleteRelationshipPropsById() does not include _id, this is not happening yet for the reqItem:', { props: reqItem.how.props })
  if (props.has('a')) throw AceError('aceFn__deleteRelationshipPropsById__invalidProp__a', 'Please ensure reqItem.how.props to deleteRelationshipPropsById() does not include a, this is not happening yet for the reqItem:', { props: reqItem.how.props })
  if (props.has('b')) throw AceError('aceFn__deleteRelationshipPropsById__invalidProp__b', 'Please ensure reqItem.how.props to deleteRelationshipPropsById() does not include b, this is not happening yet for the reqItem:', { props: reqItem.how.props })

  /** @type { td.AceGraphRelationship[] } */
  const relationshipNodes = await getMany(reqItem.how._ids)

  for (const relationshipNode of relationshipNodes) {
    for (const propName of reqItem.how.props) {
      if (typeof relationshipNode.props[propName] !== 'undefined') {
        if (!Memory.txn.schema?.relationships?.[relationshipNode.props.relationship]?.props?.[propName]) throw AceError('aceFn__deleteRelationshipPropsById__invalidRelationshipPropCombo', `Please ensure when deleting relationship props that the relationship and prop combination is defined in the schema. This is not happening yet for the relationship name: "${ relationshipNode.props.relationship }" and the prop name: "${ propName }"`, { relationship: relationshipNode.props.relationship, prop: propName })

        delete relationshipNode.props[propName]
        write('update', relationshipNode.props._id, relationshipNode)
      }
    }
  }
}
