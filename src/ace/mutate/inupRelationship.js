import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { getGraphId } from '../id/getGraphId.js'
import { overwriteIds } from './overwriteIds.js'
import { applyDefaults } from './applyDefaults.js'
import { AceError } from '../../objects/AceError.js'
import { write, getOne } from '../../util/storage.js'
import { hashMutationProp } from './hashMutationProp.js'
import { enumIdToGraphId } from '../id/enumIdToGraphId.js'
import { addToSortIndexMap } from './addToSortIndexMap.js'
import { encryptMutationProp } from './encryptMutationProp.js'
import { validatePropValue } from '../../util/validatePropValue.js'
import { delete_IdFromRelationshipProp } from './delete_IdFromRelationshipProp.js'
import { vars, getNow, getRelationship_IdsKey, getUniqueIndexKey } from '../../util/variables.js'


/**
 * Insert, Update or Upsert Relationships
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceFnOptions } options
 * @param { td.AceMutateRequestItemRelationshipInup } reqItem 
 * @returns { Promise<void> }
 */
export async function inupRelationship (jwks, options, reqItem) {
  if (Memory.txn.schema?.relationships?.[reqItem?.how?.relationship]) {
    const schemaRelationship = Memory.txn.schema?.relationships?.[reqItem.how.relationship]

    if (!schemaRelationship) throw new AceError('unknownRelationshipName', `Please ensure each relationship name is defined in the schema, this is not happening yet for reqItem.how.relationship: ${ reqItem.how.relationship }`, { reqItem })

    /** @type { td.AceGraphNode | undefined } */
    let graphNode

    if (reqItem.do === 'RelationshipUpsert') {
        reqItem.how.props._id = enumIdToGraphId({ id: reqItem.how.props._id })
        graphNode = /** @type { td.AceGraphNode | undefined } */ (await getOne(reqItem.how.props._id));
        /** @type { * } */(reqItem).do = (graphNode) ? 'RelationshipUpdate' : 'RelationshipInsert'
    }

    applyDefaults(reqItem.how.relationship, reqItem.how.props)

    if (reqItem.do === 'RelationshipUpdate') {
      if (!graphNode) graphNode = /** @type { td.AceGraphNode | undefined } */ (await getOne(reqItem.how.props._id));
      if (!graphNode) throw new AceError('invalidUpdateId', `Please ensure reqItem.how.props._id is an _id defined in your graph, this is not happening yet for reqItem.how.props._id: ${ reqItem.how.props._id }`, { reqItem })
      if (graphNode.relationship !== reqItem.how.relationship) throw new AceError('invalidUpdateRelationshipName', `Please ensure graphNode.relationship is equal to reqItem.how.relationship, this is not happening yet for graphNode.relationship: ${ graphNode.relationship },  and reqItem.how.relationship: ${ reqItem.how.relationship }`, { reqItem, graphNode })

      const aIsDifferent = graphNode.a !== reqItem.how.props.a
      const bIsDifferent = graphNode.b !== reqItem.how.props.b

      if (aIsDifferent) updatePreviousRelationshipNode(aIsDifferent, graphNode.a, /** @type { td.AceMutateRequestItemRelationshipUpdate } */ (reqItem), options)
      if (bIsDifferent) updatePreviousRelationshipNode(bIsDifferent, graphNode.b, /** @type { td.AceMutateRequestItemRelationshipUpdate } */(reqItem), options)
    }

    await inupRelationshipPut(jwks, reqItem, schemaRelationship, options)
  }
}


/**
 * @param { boolean } isDifferent 
 * @param { string } deletedNodeId 
 * @param { td.AceMutateRequestItemRelationshipUpdate } reqItem 
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
async function updatePreviousRelationshipNode (isDifferent, deletedNodeId, reqItem, options) {
  if (isDifferent) {
    const relationshipNode = /** @type { td.AceGraphNode } */ (await getOne(deletedNodeId));

    if (relationshipNode && reqItem.how.props._id) {
      delete_IdFromRelationshipProp(reqItem.how.relationship, reqItem.how.props._id, relationshipNode)
    }
  }
}


/**
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceMutateRequestItemRelationshipInup } reqItem 
 * @param { td.AceSchemaRelationshipValue } schemaRelationship 
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
async function inupRelationshipPut (jwks, reqItem, schemaRelationship, options) {
  if (reqItem.do === 'RelationshipInsert') reqItem.how.props._id = await getGraphId()

  for (const propName in reqItem.how.props) {
    if (typeof reqItem.how.props[propName] === 'string' && (propName === '_id' || propName === 'a' || propName === 'b')) overwriteIds(reqItem.how.props, propName)
    else if (propName !== '_id' && propName !== 'a' && propName !== 'b') {
      const schemaProp = schemaRelationship.props?.[propName]

      if (!schemaProp) throw new AceError('invalidRelationshipProp', `Please ensure when mutating relationships the relationship name and prop name exist in the schema. This is not happening yet for the relationship name: "${ reqItem.how.relationship }" and the prop name: "${ propName }"`, { reqItem })

      validatePropValue(propName, reqItem.how.props[propName], schemaProp.options.dataType, reqItem.how.relationship, 'relationship', 'invalidPropValue', { reqItem })

      if (schemaProp.options.dataType === 'encrypt') await encryptMutationProp('relationship', reqItem.how.relationship, reqItem.how.props, propName, reqItem.how.props[propName], schemaProp, jwks, options.ivs, reqItem.how.$o?.cryptJWK, reqItem.how.$o?.iv)
      if (schemaProp.options.dataType === 'hash') await hashMutationProp('relationship', reqItem.how.relationship, reqItem.how.props, propName, reqItem.how.props[propName], schemaProp, jwks, reqItem.how.$o?.privateJWK)
      if (schemaProp.options.dataType === 'iso' && reqItem.how.props[propName] === vars.nowIsoPlaceholder) reqItem.how.props[propName] = getNow() // populate now timestamp
      if (schemaProp.options.uniqueIndex && typeof reqItem.how.props[propName] !== 'undefined') write({ $aA: 'upsert', $aK: getUniqueIndexKey(reqItem.how.relationship, propName, reqItem.how.props[propName]), index: reqItem.how.props._id })
      if (schemaProp.options.sortIndex) addToSortIndexMap(schemaProp, reqItem.how.relationship, propName, reqItem.how.props._id)
    }
  }

  await addRelationshipToNode('a', reqItem, reqItem.how.relationship, reqItem.how.props, options)
  await addRelationshipToNode('b', reqItem, reqItem.how.relationship, reqItem.how.props, options)

  const { _id, ...propsWithout_Id } = reqItem.how.props

  const graphItem = {
    $aK: _id,
    $aR: reqItem.how.relationship,
    $aA: (reqItem.do === 'RelationshipInsert') ? 'insert' : 'update',
    ...propsWithout_Id,
  }

  write(/** @type {td.AceGraphRelationship } */ (graphItem))

  const relationship_IdsKey = getRelationship_IdsKey(reqItem.how.relationship)
  const relationship_IdsGraphItem = /** @type { td.AceGraphIndex  } */(await getOne(relationship_IdsKey));
  const index = Array.isArray(relationship_IdsGraphItem?.index) ? relationship_IdsGraphItem.index : []

  index.push(_id)
  write({ $aK: relationship_IdsKey, $aA: (reqItem.do === 'RelationshipInsert') ? 'insert' : 'update', index })
}


/**
 * @param { 'a' | 'b' } direction
 * @param { td.AceMutateRequestItemRelationshipInup } reqItem
 * @param { string } relationshipProp
 * @param { td.AceMutateRequestItemRelationshipInUpProps } props
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
async function addRelationshipToNode(direction, reqItem, relationshipProp, props, options) {
  if (reqItem.how.props[direction]) {
    const graphNode = /** @type { td.AceGraphNode | undefined } */ (await getOne(reqItem.how.props[direction]));

    if (graphNode) {
      const graphItem = {
        ...graphNode,
        ...{ [relationshipProp]: graphNode[relationshipProp] || [], $aA: reqItem.do === 'RelationshipInsert' ? 'insert' : 'update' },
      }

      graphItem[relationshipProp].push(props._id)

      write(/** @type {td.AceGraphNode} */ (graphItem))
    }
  }
}
