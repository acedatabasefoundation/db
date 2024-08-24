import { td } from '#ace'
import { getMany } from '../../util/storage.js'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'


/** @returns { Promise<void> } */
export async function validateMustBeDefined () {
  if (Memory.txn.schemaDataStructures.mustPropsMap.size) {
    for (let i = 0; i < Memory.txn.writeArray.length; i++) {
      if (/** @type { td.AceGraphRelationship} */ (Memory.txn.writeArray[i]).$aR) validateRelationshipProp(/** @type { td.AceGraphRelationship} */ (Memory.txn.writeArray[i]));
      else if (/** @type { td.AceGraphNode } */(Memory.txn.writeArray[i]).$aN) {
        const mustProps = Memory.txn.schemaDataStructures.mustPropsMap.get(/** @type { td.AceGraphNode } */(Memory.txn.writeArray[i]).$aN)

        if (mustProps?.size) {
          for (const mustProp of mustProps) {
            switch (mustProp[1].is) {
              case 'Prop':
                validateProp(/** @type { td.AceGraphNode } */(Memory.txn.writeArray[i]), mustProp[0])
                break
              case 'BidirectionalRelationshipProp':
                validateBidirectionalProp(/** @type { td.AceGraphNode } */(Memory.txn.writeArray[i]), mustProp[1].options.relationship, mustProp[0])
                break
              case 'ForwardRelationshipProp':
                await validateDirectionProp('a', /** @type { td.AceGraphNode } */(Memory.txn.writeArray[i]), mustProp[1].options.relationship, mustProp[0])
                break
              case 'ReverseRelationshipProp':
                await validateDirectionProp('b', /** @type { td.AceGraphNode } */(Memory.txn.writeArray[i]), mustProp[1].options.relationship, mustProp[0])
                break
            }
          }
        }
      }  
    }
  }
}


/**
 * @param { td.AceGraphNode } graphNode 
 * @param { string } mustProp 
 * @returns { void }
 */
function validateProp (graphNode, mustProp) {
  if (typeof graphNode[mustProp] === 'undefined') throw getEror('node', graphNode.$aN, mustProp, graphNode)
}



/**
 * @param { td.AceGraphNode } graphNode 
 * @param { string } relationship 
 * @param { string } prop 
 * @returns { void }
 */
export function validateBidirectionalProp (graphNode, relationship, prop) {
  if (typeof graphNode[relationship] === 'undefined') throw getEror('node', graphNode.$aN, prop, graphNode)
}


/**
 * @param { 'a' | 'b' } direction 
 * @param { td.AceGraphNode } graphNode 
 * @param { string } relationship 
 * @param { string } prop 
 * @returns { Promise<void> }
 */
export async function validateDirectionProp (direction, graphNode, relationship, prop) {
  let isValid = false
  const relationship_Ids = graphNode[relationship]

  if (relationship_Ids?.length) {
    const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(relationship_Ids));

    for (let i = 0; i < graphRelationships.length; i++) {
      if (graphRelationships[i][direction] === graphNode.$aK) {
        isValid = true
        break
      }
    }
  }

  if (!isValid) throw getEror('node', graphNode.$aN, prop, graphNode)
}


/**
 * @param { td.AceGraphRelationship } graphRelationship 
 * @returns { void }
 */
function validateRelationshipProp (graphRelationship) {
  const mustProps = Memory.txn.schemaDataStructures.mustPropsMap.get(graphRelationship.$aR)

  if (mustProps?.size) {
    for (const mustProp of mustProps) {
      if (typeof graphRelationship[mustProp[0]] === 'undefined') throw getEror('relationship', graphRelationship.$aR, mustProp[0], graphRelationship)
    }
  }
}


/**
 * @param { 'node' | 'relationship' } type 
 * @param { string } name
 * @param { string } propName 
 * @param { * } graphItem 
 * @returns { AceError }
 */
function getEror (type, name, propName, graphItem) {
  return new AceError('missingMustBeDefinedProp', `Please ensure each request item has all must be defined props. This is not happening yet at ${ type } "${ name }", prop: "${ propName }"`, { type, name, mustBeDefinedProp: propName, graphItem })
}
