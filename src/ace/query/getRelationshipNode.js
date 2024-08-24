import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { getDetailedResValueSectionByParent } from './getDetailedResValue.js'


/**
 * @typedef { { node: any, detailedResValueSection: null | td.AceQueryRequestItemDetailedResValueSection } } GetRelationshipNodeResponse
 * 
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { any } startingNode
 * @param { string[] } relationships 
 * @returns { GetRelationshipNodeResponse }
 */
export function getRelationshipNode (detailedResValueSection, startingNode, relationships) {
  const response = /** @type { GetRelationshipNodeResponse } */ ({ node: null, detailedResValueSection: null });
  let relationshipNodeName = detailedResValueSection.node, schemaRelationshipProp;

  if (!relationshipNodeName && startingNode.a && startingNode.b && detailedResValueSection.relationship) { // we're starting w/ a relationship query and not a node query
    const props = Memory.txn.schemaDataStructures.relationshipPropsMap?.get(detailedResValueSection.relationship)

    if (props) {
      for (const entry of props) {
        if (entry[0] !== relationships[0]) {
          relationshipNodeName = entry[1].propValue.options.node
          break
        }
      }
    }
  }


  for (let iRelationships = 0; iRelationships < relationships.length; iRelationships++) {
    const relationshipPropName = relationships[iRelationships]

    if (relationshipNodeName) {
      schemaRelationshipProp = /** @type { td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp } */ (Memory.txn.schema?.nodes?.[relationshipNodeName]?.[relationshipPropName]);
    
      if (!schemaRelationshipProp) { // IF the relationshipPropName is not in the schema it might be an alias
        for (const resValueKey in detailedResValueSection.resValue) {
          if (detailedResValueSection.resValue[resValueKey]?.$o?.alias === relationshipPropName) { // if one of the props has an alias that matches the relationshipPropName
            schemaRelationshipProp = /** @type { td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp } */ (Memory.txn.schema?.nodes?.[relationshipNodeName]?.[resValueKey]); // use the resValueKey rather then the alias name in the relationships array
            break
          }
        }
      }
    }

    if (!schemaRelationshipProp) throw new AceError('getRelationshipNode__falsyRelationship', `Please align each item in the relationships array with valid schema props, this is not happening yet for the relationships: ${ relationshipPropName }`, { relationships })
    else {
      if (iRelationships === 0) {
        response.detailedResValueSection = /** @type { td.AceQueryRequestItemDetailedResValueSection } */ (detailedResValueSection.resValue[relationshipPropName]);
      } else if (response.detailedResValueSection) {
        const relationshipDetailedResValueSection = getDetailedResValueSectionByParent(detailedResValueSection.resValue, relationshipPropName, detailedResValueSection)
        response.detailedResValueSection = relationshipDetailedResValueSection
      }

      const nodePropName = response.detailedResValueSection?.aliasResKey || relationshipPropName

      if (iRelationships === 0) response.node = startingNode?.[nodePropName]
      else if (response.node) response.node = response.node[nodePropName]
      else response.node = null

      if (response.node) relationshipNodeName = schemaRelationshipProp?.options.node
      else break
    }
  }
  
  if (schemaRelationshipProp?.options?.has === 'many' && Array.isArray(response.node) && response.node.length) throw new AceError('getRelationshipNode__endingWithMany', `Please ensure the relationships array ends with a property that is a "one" relationship, and not a "many" relationship. This way we end on one node`, { relationships, do: detailedResValueSection.do, resValue: detailedResValueSection.resValue })

  return response
}
