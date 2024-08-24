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
export async function schemaUpdatePropMustBeDefined(reqItem, isSourceSchemaPush) {
  let schemaUpdated = false

  /** @type { Map<string, { reqProp: td.AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem, schemaProp: td.AceSchemaProp | td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp }[]> } Map<nodeName, { reqProp, schemaProp }[]>  */
  const propsByNode = new Map()

  /** @type { Map<string, td.AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem[]> } Map<relationshipName, reqProp[]>  */
  const propsByRelationship = new Map()

  for (let i = 0; i < reqItem.how.length; i++) {
    const schemaProp = Memory.txn.schema?.nodes[reqItem.how[i].nodeOrRelationship]?.[reqItem.how[i].prop] || Memory.txn.schema?.relationships?.[reqItem.how[i].nodeOrRelationship]?.props?.[reqItem.how[i].prop]


    // validate reqItem
    if (!schemaProp) throw new AceError('schemaUpdatePropMustBeDefined__invalidReq', `Please ensure when attempting to update node or relationship "mustBeDefined", the node or relationship and prop are defined in your schema. This is not happening yet for the node or relationship: "${ reqItem.how[i].nodeOrRelationship }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: reqItem.how[i] })
    if (typeof reqItem.how[i].mustBeDefined !== 'boolean') throw new AceError('schemaUpdatePropMustBeDefined__invalidType', `Please ensure when attempting to update node or relationship "mustBeDefined", the typeof reqItemProp.mustBeDefined is "boolean". This is not happening yet for the node or relationship: "${ reqItem.how[i].nodeOrRelationship }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: reqItem.how[i] })

  
    if (schemaProp.options.mustBeDefined && !reqItem.how[i].mustBeDefined) { // removing mustBeDefined from schema
      schemaUpdated = true
      delete schemaProp.options.mustBeDefined
    } else if (!schemaProp.options.mustBeDefined && reqItem.how[i].mustBeDefined) {
      switch (schemaProp.is) {
        case 'Prop':
        case 'BidirectionalRelationshipProp':
        case 'ForwardRelationshipProp':
        case 'ReverseRelationshipProp':
          // add to propsByNode
          const nodeProps = propsByNode.get(reqItem.how[i].nodeOrRelationship) || []
          nodeProps.push({ reqProp: reqItem.how[i], schemaProp })
          propsByNode.set(reqItem.how[i].nodeOrRelationship, nodeProps)

          // update schema
          schemaUpdated = true
          schemaProp.options.mustBeDefined = true
          break
        case 'RelationshipProp':
          // add to propsByRelationship
          const relationshipProps = propsByRelationship.get(reqItem.how[i].nodeOrRelationship) || []
          relationshipProps.push(reqItem.how[i])
          propsByRelationship.set(reqItem.how[i].nodeOrRelationship, relationshipProps)

          // update schema
          schemaUpdated = true
          schemaProp.options.mustBeDefined = true
          break
      }
    }
  }

  // update schema nodes
  for (const [ nodeName, props ] of propsByNode) {
    const nodeIdsKey = getNodeIdsKey(nodeName);
    const allNodeIds = /** @type { td.AceGraphIndex | undefined } */ (await getOne(nodeIdsKey));

    if (Array.isArray(allNodeIds?.index)) {
      const graphNodes = /** @type { td.AceGraphNode[] } */ (await getMany(allNodeIds.index))

      for (let i = 0; i < graphNodes.length; i++) {
        for (let j = 0; j < props.length; j++) {
          switch (props[j].schemaProp.is) {
            case 'Prop':
              if (typeof graphNodes[i][props[j].reqProp.prop] === 'undefined') {
                throw new AceError('schemaUpdatePropMustBeDefined', `Please ensure each request item has all must be defined props. This is not happening yet at node: "${ nodeName }", prop: "${ props[j].reqProp.prop }", id: "${ graphNodes[i].props.id }"`, { graphNode: graphNodes[i] })
              }
              break
            case 'BidirectionalRelationshipProp':
              validateBidirectionalProp(graphNodes[i], /** @type { td.AceSchemaBidirectionalRelationshipProp } */ (props[j].schemaProp).options.relationship, props[j].reqProp.prop)
              break
            case 'ForwardRelationshipProp':
              await validateDirectionProp('a', graphNodes[i], /** @type { td.AceSchemaForwardRelationshipProp } */ (props[j].schemaProp).options.relationship, props[j].reqProp.prop)
              break
            case 'ReverseRelationshipProp':
              await validateDirectionProp('b', graphNodes[i], /** @type { td.AceSchemaReverseRelationshipProp } */ (props[j].schemaProp).options.relationship, props[j].reqProp.prop)
              break
          }
        }
      }
    }
  }

  // validate schema relationships
  for (const [ relationshipName, props ] of propsByRelationship) {
    const relationship_IdsKey = getRelationship_IdsKey(relationshipName);
    const allRelationship_Ids = /** @type { td.AceGraphIndex | undefined } */ (await getOne(relationship_IdsKey));

    if (Array.isArray(allRelationship_Ids?.index)) {
      const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(allRelationship_Ids.index));

      for (let i = 0; i < graphRelationships.length; i++) {
        if (graphRelationships[i]) {
          for (let j = 0; j < props.length; j++) {
            if (typeof graphRelationships[i][props[j].prop] === 'undefined') {
              throw new AceError('schemaUpdatePropMustBeDefined', `Please ensure each request item has all must be defined props. This is not happening yet at relationship: "${ relationshipName }", prop: "${ props[j].prop }", _id: "${ graphRelationships[i].$aK }"`, { graphRelationship: graphRelationships[i] })
            }
          }
        }
      }
    }
  }

  if (schemaUpdated) doneSchemaUpdate(isSourceSchemaPush)
}
