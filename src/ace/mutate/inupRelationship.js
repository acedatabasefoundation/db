import { td, enums } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { getGraphId } from '../id/getGraphId.js'
import { overwriteIds } from './overwriteIds.js'
import { applyDefaults } from './applyDefaults.js'
import { AceError } from '../../objects/AceError.js'
import { write, getOne } from '../../util/storage.js'
import { enumIdToGraphId } from '../id/enumIdToGraphId.js'
import { validatePropValue } from '../../util/validatePropValue.js'
import { delete_IdFromRelationshipProp } from './delete_IdFromRelationshipProp.js'
import { ENUM_ID_PREFIX, ADD_NOW_DATE, getNow, getRelationshipProp, getRelationshipIdsKey } from '../../util/variables.js'


/**
 * Insert / Update Relationships
 * @param { td.AceMutateRequestItemRelationshipInup } reqItem 
 * @returns { Promise<void> }
 */
export async function inupRelationship (reqItem) {
  if (Memory.txn.schema?.relationships?.[reqItem?.how?.relationship]) {
    const schemaRelationship = Memory.txn.schema?.relationships?.[reqItem.how.relationship]

    if (!schemaRelationship) throw AceError('aceFn__unknownRelationshipName', `Please ensure each relationship name is defined in the schema, this is not happening yet for reqItem.how.relationship: ${ reqItem.how.relationship }`, { reqItem })

    /** @type { td.AceGraphNode | undefined } */
    let graphNode

    switch (reqItem.do) {
      case 'RelationshipInsert':
        reqItem = /** @type { td.AceMutateRequestItemRelationshipInsert } */ (reqItem)
        break
      case 'RelationshipUpdate':
        reqItem = /** @type { td.AceMutateRequestItemRelationshipUpdate } */(reqItem)
        break
      case 'RelationshipUpsert':
        reqItem.how.props._id = enumIdToGraphId({ id: reqItem.how.props._id })
        graphNode = await getOne(reqItem.how.props._id)
        reqItem = /** @type { * } */(reqItem)

        if (graphNode) {
          reqItem.do = 'RelationshipUpdate'
          reqItem = /** @type { td.AceMutateRequestItemRelationshipUpdate } */(reqItem)
        } else {
          reqItem.do = 'RelationshipInsert'
          reqItem = /** @type { td.AceMutateRequestItemRelationshipInsert } */(reqItem)
        }
        break
    }

    applyDefaults(reqItem.how.relationship, reqItem.how.props)

    if (reqItem.do === 'RelationshipUpdate') {
      if (!graphNode) graphNode = await getOne(reqItem.how.props._id)
      if (!graphNode) throw AceError('aceFn__invalidUpdateId', `Please ensure reqItem.how.props._id is an _id defined in your graph, this is not happening yet for reqItem.how.props._id: ${ reqItem.how.props._id }`, { reqItem })
      if (graphNode.relationship !== reqItem.how.relationship) throw AceError('aceFn__invalidUpdateRelationshipName', `Please ensure graphNode.relationship is equal to reqItem.how.relationship, this is not happening yet for graphNode.relationship: ${ graphNode.relationship },  and reqItem.how.relationship: ${ reqItem.how.relationship }`, { reqItem, graphNode })

      const aIsDifferent = graphNode.props.a !== reqItem.how.props.a
      const bIsDifferent = graphNode.props.b !== reqItem.how.props.b

      if (aIsDifferent) updatePreviousRelationshipNode(aIsDifferent, graphNode.a, reqItem)
      if (bIsDifferent) updatePreviousRelationshipNode(bIsDifferent, graphNode.b, reqItem)

      reqItem.how.props = { ...graphNode.props, ...reqItem.how.props }
    }

    await inupRelationshipPut(reqItem, schemaRelationship)
  }
}


/**
 * @param { boolean } isDifferent 
 * @param { string } deletedNodeId 
 * @param { td.AceMutateRequestItemRelationshipUpdate } reqItem 
 * @returns { Promise<void> }
 */
async function updatePreviousRelationshipNode (isDifferent, deletedNodeId, reqItem) {
  if (isDifferent) {
    /** @type { td.AceGraphNode } */
    const relationshipNode = await getOne(deletedNodeId)

    if (relationshipNode && reqItem.how.props._id) {
      delete_IdFromRelationshipProp(getRelationshipProp(reqItem.how.relationship), reqItem.how.props._id, relationshipNode)
    }
  }
}


/**
 * @param { td.AceMutateRequestItemRelationshipInup } reqItem 
 * @param { td.AceSchemaRelationshipValue } schemaRelationship 
 * @returns { Promise<void> }
 */
async function inupRelationshipPut (reqItem, schemaRelationship) {
  const props = reqItem.how.props

  if (reqItem.do === 'RelationshipInsert') props._id = await getGraphId()

  for (const relationshipPropName in props) {
    const relationshipPropValue = props[relationshipPropName]

    if (typeof relationshipPropValue === 'string' && relationshipPropValue.startsWith(ENUM_ID_PREFIX)) overwriteIds(props, relationshipPropName)
    else if (relationshipPropName !== '_id' && relationshipPropName !== 'a' && relationshipPropName !== 'b') {
      const schemaProp = schemaRelationship.props?.[relationshipPropName]

      if (schemaProp) {
        validatePropValue(relationshipPropName, relationshipPropValue, schemaProp.options.dataType, reqItem.how.relationship, 'relationship', 'invalidPropValue', { reqItem })

        if (relationshipPropValue === ADD_NOW_DATE && schemaProp.options.dataType === enums.dataTypes.isoString) props[relationshipPropName] = getNow() // populate now timestamp
      }
    }
  }

  const relationshipProp = getRelationshipProp(reqItem.how.relationship)
  await addRelationshipToNode('a', reqItem, relationshipProp, props)
  await addRelationshipToNode('b', reqItem, relationshipProp, props)

  if (reqItem.do === 'RelationshipInsert') write('insert', props._id, reqItem.how)
  else write('update', props._id, reqItem.how)

  const relationshipIdsKey = getRelationshipIdsKey(reqItem.how.relationship)

  /** @type { (string | number)[] } */
  const relationshipIdsArray = await getOne(relationshipIdsKey) || []
  const relationshipIdsSet = new Set(relationshipIdsArray)

  relationshipIdsSet.add(props._id) // add relationship id to relationship index

  if (reqItem.do === 'RelationshipInsert') write('insert', relationshipIdsKey, [ ...relationshipIdsSet ])
  else write('update', relationshipIdsKey, [ ...relationshipIdsSet ])
}


/**
 * @param { 'a' | 'b' } direction
 * @param { td.AceMutateRequestItemRelationshipInup } reqItem
 * @param { string } relationshipProp
 * @param { td.AceMutateRequestItemRelationshipInUpProps } props
 * @returns { Promise<void> }
 */
async function addRelationshipToNode (direction, reqItem, relationshipProp, props) {
  const graphNodeId = reqItem.how.props[direction]

  if (graphNodeId) {
    /** @type { td.AceGraphNode } */
    const graphNode = await getOne(graphNodeId)

    if (!graphNode?.[relationshipProp]) graphNode[relationshipProp] = [props._id]
    else graphNode[relationshipProp].push(props._id)

    if (reqItem.do === 'RelationshipInsert') write('insert', graphNode.props.id, graphNode)
    else write('update', graphNode.props.id, graphNode)
  }
}
