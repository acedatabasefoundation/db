import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { getMany, write } from '../../util/storage.js'


/**
 * @param { td.AceMutateRequestItemRelationshipPropDeleteData } reqItem
 * @returns { Promise<void> }
 */
export async function deleteRelationshipPropsById (reqItem) {
  if (!Array.isArray(reqItem?.how?._ids) || !reqItem.how._ids.length) throw AceError('aceFn__deleteRelationshipPropsById__invalid_Ids', 'Please ensure reqItem.how.props._ids to deleteRelationshipPropsById() is an array of ids, this is not happening yet for the reqItem:', { reqItem })
  if (!Array.isArray(reqItem?.how?.props) || !reqItem.how.props.length) throw AceError('aceFn__deleteRelationshipPropsById__invalidProps', 'Please ensure reqItem.how.props to deleteRelationshipPropsById() is an array of pupulated string props, this is not happening yet for the reqItem:', { reqItem })

  const props = new Set(reqItem.how.props)

  if (props.has('_id')) throw AceError('aceFn__deleteRelationshipPropsById__invalidProp__id', 'Please ensure reqItem.how.props to deleteRelationshipPropsById() does not include _id, this is not happening yet for the reqItem:', { props: reqItem.how.props })
  if (props.has('a')) throw AceError('aceFn__deleteRelationshipPropsById__invalidProp__a', 'Please ensure reqItem.how.props to deleteRelationshipPropsById() does not include a, this is not happening yet for the reqItem:', { props: reqItem.how.props })
  if (props.has('b')) throw AceError('aceFn__deleteRelationshipPropsById__invalidProp__b', 'Please ensure reqItem.how.props to deleteRelationshipPropsById() does not include b, this is not happening yet for the reqItem:', { props: reqItem.how.props })

  /** @type { Map<string | number, td.AceGraphRelationship> } */
  const relationshipNodes = await getMany(reqItem.how._ids)

  for (const entry of relationshipNodes) {
    for (const propName of reqItem.how.props) {
      if (typeof entry[1].props[propName] !== 'undefined') {
        if (!Memory.txn.schema?.relationships?.[entry[1].props.relationship]?.props?.[propName]) throw AceError('aceFn__deleteRelationshipPropsById__invalidRelationshipPropCombo', `Please ensure when delete relationship props that the relationship and prop combination is defined in the schema. This is not happening yet for the relationship name: ${ entry[1].props.relationship } and the prop name: ${ propName }`, { relationship: entry[1].props.relationship, prop: propName })

        delete entry[1].props[propName]
        write('update', entry[1].props._id, entry[1])
      }
    }
  }
}
