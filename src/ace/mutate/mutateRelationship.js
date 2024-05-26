import { td } from '#ace'
import { memory } from '../../memory/memory.js'
import { AceError } from '../../objects/AceError.js'
import { write, getMany, getOne } from '../storage.js'
import { getRelationshipProp, getRelationshipIdsKey } from '../../util/variables.js'


/**
 * @param { string } prop 
 * @param { string | number } _id 
 * @param { td.AceGraphNode } relationshipNode
 * @returns { Promise<void> }
 */
export async function deleteIdFromRelationshipProp (prop, _id, relationshipNode) {
  if (!Array.isArray(relationshipNode?.[prop])) throw AceError('aceFn__deleteIdFromRelationshipProp__notArray', 'The request fails b/c !Array.isArray(relationshipNode?.[prop])', { relationshipNode: relationshipNode, prop })

  if (relationshipNode[prop].length === 1 && relationshipNode[prop][0] === _id) delete relationshipNode[prop]
  else {
    for (let i = 0; i < relationshipNode[prop].length; i++) {
      if (_id === relationshipNode[prop][i]) relationshipNode[prop].splice(i, 1)
    }

    if (!relationshipNode[prop].length) delete relationshipNode[prop]
  }

  await write('update', relationshipNode.props.id, relationshipNode)
}


/**
 * @param { string } relationshipName 
 * @param { string } _id 
 * @returns { Promise<void> }
 */
export async function delete_IdFromRelationshipIndex (relationshipName, _id) {
  if (!relationshipName) throw AceError('aceFn__delete_IdFromRelationshipIndex__falsyRelationshipName', 'The request fails b/c relationshipName must be truthy', { relationshipName, _id })

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
  else await write('delete', relationshipIdsKey)
}


/**
 * @param { (string | number)[] } _ids
 * @returns { Promise<void> }
 */
export async function deleteRelationshipsBy_Ids (_ids) {
  if (!Array.isArray(_ids) || !_ids.length) throw AceError('aceFn__deleteRelationshipsBy_Ids__invalidIds', 'The request fails b/c _ids must be an array of ids', { _ids })

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


/**
 * @param { td.AceMutateRequestItemRelationshipPropDeleteData } reqItem
 * @returns { Promise<void> }
 */
export async function relationshipPropDeleteData (reqItem) {
  if (!Array.isArray(reqItem?.how?._ids) || !reqItem.how._ids.length) throw AceError('aceFn__relationshipPropDeleteData__invalid_Ids', 'The request fails b/c reqItem.how.props._ids must be an array of ids', { reqItem })
  if (!Array.isArray(reqItem?.how?.props) || !reqItem.how.props.length) throw AceError('aceFn__relationshipPropDeleteData__invalidProps', 'The request fails b/c reqItem.how.props must be an array of string props', { reqItem })

  const props = new Set(reqItem.how.props)

  if (props.has('_id')) throw AceError('aceFn__relationshipPropDeleteData__invalidProp', 'The request fails b/c reqItem.how.props must not include _id', { props: reqItem.how.props })
  if (props.has('a')) throw AceError('aceFn__relationshipPropDeleteData__invalidProp', 'The request fails b/c reqItem.how.props must not include a', { props: reqItem.how.props })
  if (props.has('b')) throw AceError('aceFn__relationshipPropDeleteData__invalidProp', 'The request fails b/c reqItem.how.props must not include b', { props: reqItem.how.props })

  /** @type { Map<string | number, td.AceGraphRelationship> } */
  const relationshipNodes = await getMany(reqItem.how._ids)

  for (const entry of relationshipNodes) {
    for (const propName of reqItem.how.props) {
      if (typeof entry[1].props[propName] !== 'undefined') {
        if (!memory.txn.schema?.relationships?.[entry[1].props.relationship]?.props?.[propName]) throw AceError('aceFn__relationshipPropDeleteData__invalidRelationshipPropCombo', 'The relationship and the prop cannot be deleted b/c they are not defined in your schema', { relationship: entry[1].props.relationship, prop: propName })

        delete entry[1].props[propName]
        write('update', entry[1].props._id, entry[1])
      }
    }
  }
}
