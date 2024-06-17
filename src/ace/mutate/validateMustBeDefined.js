import { td } from '#ace'
import { getMany } from '../../util/storage.js'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { getRelationshipProp } from '../../util/variables.js'


/** @returns { Promise<void> } */
export async function validateMustBeDefined () {
  if (Memory.txn.schemaDataStructures.mustPropsMap.size) {
    for (const writeItem of Memory.txn.writeMap) {
      if (writeItem[1].value?.relationship) validateRelationshipProp(writeItem[1].value.relationship, writeItem[1].value.props)
      else if (writeItem[1].value?.node) {
        const mustProps = Memory.txn.schemaDataStructures.mustPropsMap.get(writeItem[1].value.node)

        if (mustProps?.size) {
          for (const mustProp of mustProps) {
            switch (mustProp[1].is) {
              case 'Prop':
                validateProp(writeItem[1].value.node, writeItem[1].value.props, mustProp[0])
                break
              case 'BidirectionalRelationshipProp':
                validateBidirectionalProp(writeItem[1].value.node, mustProp[1].options.relationship, mustProp[0], writeItem[1].value, writeItem[1].value.props)
                break
              case 'ForwardRelationshipProp':
                await validateDirectionProp('a', writeItem[1].value.node, mustProp[1].options.relationship, mustProp[0], writeItem[1].value, writeItem[1].value.props)
                break
              case 'ReverseRelationshipProp':
                await validateDirectionProp('b', writeItem[1].value.node, mustProp[1].options.relationship, mustProp[0], writeItem[1].value, writeItem[1].value.props)
                break
            }
          }
        }
      }  
    }
  }
}


/**
 * @param { string } node 
 * @param { string } relationship 
 * @param { string } prop 
 * @param { td.AceGraphNode } graphNode 
 * @param { td.AceGraphNodeProps } props 
 * @returns { void }
 */
export function validateBidirectionalProp (node, relationship, prop, graphNode, props) {
  const relationshipProp = getRelationshipProp(relationship)
  if (typeof graphNode[relationshipProp] === 'undefined') throw getEror('node', node, prop, props)
}


/**
 * @param { 'a' | 'b' } direction 
 * @param { string } node 
 * @param { string } relationship 
 * @param { string } prop 
 * @param { td.AceGraphNode } graphNode 
 * @param { td.AceGraphNodeProps } props 
 * @returns { Promise<void> }
 */
export async function validateDirectionProp (direction, node, relationship, prop, graphNode, props) {
  let isValid = false
  const relationshipProp = getRelationshipProp(relationship)
  const relationship_Ids = graphNode[relationshipProp]

  if (relationship_Ids?.length) {
    /** @type { td.AceGraphRelationship[] } */
    const graphRelationships = await getMany(relationship_Ids)

    for (const graphRelationship of graphRelationships) {
      if (graphRelationship.props[direction] === graphNode.props.id) {
        isValid = true
        break
      }
    }
  }

  if (!isValid) throw getEror('node', node, prop, props)
}


/**
 * @param { string } node 
 * @param { td.AceGraphNodeProps } props 
 * @param { string } mustProp 
 * @returns { void }
 */
function validateProp (node, props, mustProp) {
  if (typeof props[mustProp] === 'undefined') throw getEror('node', node, mustProp, props)
}


/**
 * @param { string } relationship 
 * @param { td.AceGraphRelationshipProps } props 
 * @returns { void }
 */
function validateRelationshipProp (relationship, props) {
  const mustProps = Memory.txn.schemaDataStructures.mustPropsMap.get(relationship)

  if (mustProps?.size) {
    for (const mustProp of mustProps) {
      if (typeof props[mustProp[0]] === 'undefined') throw getEror('relationship', relationship, mustProp[0], props)
    }
  }
}


/**
 * @param { 'node' | 'relationship' } type 
 * @param { string } name
 * @param { string } propName 
 * @param { * } graphItem 
 * @returns { td.AceError }
 */
function getEror (type, name, propName, graphItem) {
  return AceError('missingMustBeDefinedProp', `Please ensure each request item has all must be defined props. This is not happening yet at ${ type } "${ name }", prop: "${ propName }"`, { type, name, mustBeDefinedProp: propName, graphItem })
}
