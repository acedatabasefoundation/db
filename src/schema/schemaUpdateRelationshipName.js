import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getMany, getOne } from '../util/storage.js'
import { getRelationshipIdsKey, getRelationshipProp } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateRelationshipName } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateRelationshipName (reqItem) {
  for (const { nowName, newName } of reqItem.how.relationships) {
    if (!Memory.txn.schema?.relationships?.[nowName]) throw AceError('aceFn__schemaUpdateRelationshipName__invalidNowName', `Please ensure that when updating a relationship name, the nowName is defined as a relationship in your schea, this is not happening yet for the nowName: ${ nowName }`, { nowName, newName })

    // update relationship on each graphRelationship
    const relationshipIdsKey = getRelationshipIdsKey(nowName)

    /** @type { (string | number)[] } */
    const relationshipIds = await getOne(relationshipIdsKey)

    if (relationshipIds.length) {
      const graphNodeIds = [] // put a and b node ids here

      /** @type { Map<string | number, td.AceGraphRelationship> } */
      const graphRelationships = await getMany(relationshipIds)

      // update graphRelationship.relationship
      for (const entry of graphRelationships) {
        entry[1].relationship = newName
        write('update', entry[0], entry[1])
        graphNodeIds.push(entry[1].props.a)
        graphNodeIds.push(entry[1].props.b)
      }

      /** @type { Map<string | number, td.AceGraphNode> } */
      const graphNodes = await getMany(graphNodeIds)
      const nowRelationshipProp = getRelationshipProp(nowName)
      const newRelationshipProp = getRelationshipProp(newName)

      // update graphNode.$r__[ nowName ]
      for (const entry of graphNodes) {
        if (entry[1][nowRelationshipProp]) {
          entry[1][newRelationshipProp] = entry[1][nowRelationshipProp]
          delete entry[1][nowRelationshipProp]
          write('update', entry[0], entry[1])
        }
      }
    }

    // update relationshipIdsKey
    const newRelationshipIdsKey = getRelationshipIdsKey(newName)
    write('update', newRelationshipIdsKey, relationshipIds)
    write('delete', relationshipIdsKey)

    // update schema relationship
    Memory.txn.schema.relationships[newName] = Memory.txn.schema.relationships[nowName]
    delete Memory.txn.schema.relationships[nowName]

    // update schema node props
    const relationshipNodeProps = Memory.txn.schemaDataStructures.relationshipPropsMap?.get(nowName)

    if (relationshipNodeProps) {
      for (const entry of relationshipNodeProps) {
        entry[1].propValue.options.relationship = newName
        Memory.txn.schema.nodes[entry[1].propNode][entry[0]] = entry[1].propValue
      }
    }

    doneSchemaUpdate()
  }
}
