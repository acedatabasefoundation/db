import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { getOne, getMany } from '../util/storage.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { getNodeIdsKey, getRelationship_IdsKey } from '../util/variables.js'
import { validateBidirectionalProp, validateDirectionProp } from '../ace/mutate/validateMustBeDefined.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdatePropMustBeDefined } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaUpdatePropMustBeDefined (reqItem, isSourceSchemaPush) {
  let schemaUpdated = false

  /** @type { Map<string, { reqProp: td.AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem, schemaProp: td.AceSchemaProp | td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp }[]> } Map<nodeName, { reqProp, schemaProp }[]>  */
  const propsByNode = new Map()

  /** @type { Map<string, td.AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem[]> } Map<relationshipName, reqProp[]>  */
  const propsByRelationship = new Map()

  for (const prop of reqItem.how) {
    const schemaProp = Memory.txn.schema?.nodes[prop.nodeOrRelationship]?.[prop.prop] || Memory.txn.schema?.relationships?.[prop.nodeOrRelationship]?.props?.[prop.prop]


    // validate reqItem
    if (!schemaProp) throw AceError('schemaUpdatePropMustBeDefined__invalidReq', `Please ensure when attempting to update node or relationship "mustBeDefined", the node or relationship and prop are defined in your schema. This is not happening yet for the node or relationship: "${ prop.nodeOrRelationship }" and prop: "${ prop.prop }"`, { reqItemProp: prop })
    if (typeof prop.mustBeDefined !== 'boolean') throw AceError('schemaUpdatePropMustBeDefined__invalidType', `Please ensure when attempting to update node or relationship "mustBeDefined", the typeof reqItemProp.mustBeDefined is "boolean". This is not happening yet for the node or relationship: "${ prop.nodeOrRelationship }" and prop: "${ prop.prop }"`, { reqItemProp: prop })

  
    if (schemaProp.options.mustBeDefined && !prop.mustBeDefined) { // removing mustBeDefined from schema
      schemaUpdated = true
      delete schemaProp.options.mustBeDefined
    } else if (!schemaProp.options.mustBeDefined && prop.mustBeDefined) {
      switch (schemaProp.is) {
        case 'Prop':
        case 'BidirectionalRelationshipProp':
        case 'ForwardRelationshipProp':
        case 'ReverseRelationshipProp':
          // add to propsByNode
          const nodeProps = propsByNode.get(prop.nodeOrRelationship) || []
          nodeProps.push({ reqProp: prop, schemaProp })
          propsByNode.set(prop.nodeOrRelationship, nodeProps)

          // update schema
          schemaUpdated = true
          schemaProp.options.mustBeDefined = true
          break
        case 'RelationshipProp':
          // add to propsByRelationship
          const relationshipProps = propsByRelationship.get(prop.nodeOrRelationship) || []
          relationshipProps.push(prop)
          propsByRelationship.set(prop.nodeOrRelationship, relationshipProps)

          // update schema
          schemaUpdated = true
          schemaProp.options.mustBeDefined = true
          break
      }
    }
  }

  // update schema nodes
  for (const [ nodeName, props ] of propsByNode) {
    const nodeIdsKey = getNodeIdsKey(nodeName)

    /** @type { (string | number)[] } */
    const allNodeIds = await getOne(nodeIdsKey)

    if (Array.isArray(allNodeIds)) {
      /** @type { td.AceGraphNode[] } */
      const graphNodes = await getMany(allNodeIds)

      for (const graphNode of graphNodes) {
        for (const { reqProp, schemaProp } of props) {
          switch (schemaProp.is) {
            case 'Prop':
              if (typeof graphNode.props[reqProp.prop] === 'undefined') throw AceError('schemaUpdatePropMustBeDefined', `Please ensure each request item has all must be defined props. This is not happening yet at node: "${ nodeName }", prop: "${ reqProp.prop }", id: "${ graphNode.props.id }"`, { graphNode })
              break
            case 'BidirectionalRelationshipProp':
              validateBidirectionalProp(nodeName, schemaProp.options.relationship, reqProp.prop, graphNode, graphNode.props)
              break
            case 'ForwardRelationshipProp':
              await validateDirectionProp('a', nodeName, schemaProp.options.relationship, reqProp.prop, graphNode, graphNode.props)
              break
            case 'ReverseRelationshipProp':
              await validateDirectionProp('b', nodeName, schemaProp.options.relationship, reqProp.prop, graphNode, graphNode.props)
              break
          }
        }
      }
    }
  }

  // validate schema relationships
  for (const [ relationshipName, props ] of propsByRelationship) {
    const relationship_IdsKey = getRelationship_IdsKey(relationshipName)

    /** @type { (string | number)[] } */
    const allRelationship_Ids = await getOne(relationship_IdsKey)

    if (Array.isArray(allRelationship_Ids)) {
      /** @type { td.AceGraphRelationship[] } */
      const graphRelationships = await getMany(allRelationship_Ids)

      for (const graphRelationship of graphRelationships) {
        for (const reqProp of props) {
          if (typeof graphRelationship.props[reqProp.prop] === 'undefined') throw AceError('schemaUpdatePropMustBeDefined', `Please ensure each request item has all must be defined props. This is not happening yet at relationship: "${ relationshipName }", prop: "${ reqProp.prop }", _id: "${ graphRelationship.props._id }"`, { graphRelationship })
        }
      }
    }
  }

  if (schemaUpdated) doneSchemaUpdate(isSourceSchemaPush)
}
