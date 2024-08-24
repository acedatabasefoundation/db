import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'
import { getRelationship_IdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaRenameRelationship } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaRenameRelationship (reqItem, isSourceSchemaPush) {
  for (let i = 0; i < reqItem.how.length; i++) {
    if (!Memory.txn.schema?.relationships?.[reqItem.how[i].nowName]) throw new AceError('schemaRenameRelationship__invalidNowName', `Please ensure that when updating a relationship name, the nowName is defined as a relationship in your schea, this is not happening yet for the nowName: ${ reqItem.how[i].nowName }`, { nowName: reqItem.how[i].nowName, newName: reqItem.how[i].newName })
    
    const relationship_IdsKey = getRelationship_IdsKey(reqItem.how[i].nowName); // update relationship on each graphRelationship
    const relationship_Ids = /** @type { td.AceGraphIndex | undefined } */ (await getOne(relationship_IdsKey));

    if (Array.isArray(relationship_Ids?.index)) {
      const graphNodeIds = [] // put a and b node ids here
      const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(relationship_Ids.index));

      for (let j = 0; j < graphRelationships.length; j++) { // update graphRelationship.relationship
        if (graphRelationships[j]) {
          graphRelationships[j].$aA = 'update'
          graphRelationships[j].relationship = reqItem.how[i].newName
          write(graphRelationships[j])
          graphNodeIds.push(graphRelationships[j].a)
          graphNodeIds.push(graphRelationships[j].b)
        }
      }

      const graphNodes = /** @type { td.AceGraphNode[] } */ (await getMany(graphNodeIds))

      for (let j = 0; j < graphNodes.length; j++) { // update graphNode[ newRelationshipProp ]
        if (graphNodes[j][reqItem.how[i].nowName]) {
          graphNodes[j][reqItem.how[i].newName] = graphNodes[j][reqItem.how[i].nowName]
          delete graphNodes[j][reqItem.how[i].nowName]
          graphNodes[j].$aA = 'update'
          write(graphNodes[j])
        }
      }
    }

    const newRelationship_IdsKey = getRelationship_IdsKey(reqItem.how[i].newName) // update relationship_IdsKey

    if (relationship_Ids) write({ $aA: 'update', $aK: newRelationship_IdsKey, index: relationship_Ids.index })
    
    write({ $aA: 'delete', $aK: relationship_IdsKey })

    // update schema relationship
    Memory.txn.schema.relationships[reqItem.how[i].newName] = Memory.txn.schema.relationships[reqItem.how[i].nowName]
    delete Memory.txn.schema.relationships[reqItem.how[i].nowName]
    
    const relationshipNodeProps = Memory.txn.schemaDataStructures.relationshipPropsMap?.get(reqItem.how[i].nowName) // update schema node props

    if (relationshipNodeProps) {
      for (const entry of relationshipNodeProps) {
        entry[1].propValue.options.relationship = reqItem.how[i].newName
        Memory.txn.schema.nodes[entry[1].propNode][entry[0]] = entry[1].propValue
      }
    }

    doneSchemaUpdate(isSourceSchemaPush)
  }
}
