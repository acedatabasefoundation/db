import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'
import { getRelationship_IdsKey, getRelationshipProp } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaRenameRelationship } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaRenameRelationship (reqItem, isSourceSchemaPush) {
  for (const { nowName, newName } of reqItem.how) {
    if (!Memory.txn.schema?.relationships?.[nowName]) throw AceError('schemaRenameRelationship__invalidNowName', `Please ensure that when updating a relationship name, the nowName is defined as a relationship in your schea, this is not happening yet for the nowName: ${ nowName }`, { nowName, newName })

    // update relationship on each graphRelationship
    const relationship_IdsKey = getRelationship_IdsKey(nowName)

    /** @type { (string | number)[] } */
    const relationship_Ids = await getOne(relationship_IdsKey) || []

    if (relationship_Ids.length) {
      const graphNodeIds = [] // put a and b node ids here

      /** @type { td.AceGraphRelationship[] } */
      const graphRelationships = await getMany(relationship_Ids)

      // update graphRelationship.relationship
      for (const graphRelationship of graphRelationships) {
        graphRelationship.relationship = newName
        write('update', graphRelationship.props._id, graphRelationship)
        graphNodeIds.push(graphRelationship.props.a)
        graphNodeIds.push(graphRelationship.props.b)
      }

      /** @type { td.AceGraphNode[] } */
      const graphNodes = await getMany(graphNodeIds)
      const nowRelationshipProp = getRelationshipProp(nowName)
      const newRelationshipProp = getRelationshipProp(newName)

      // update graphNode.$r__[ nowName ]
      for (const graphNode of graphNodes) {
        if (graphNode[nowRelationshipProp]) {
          graphNode[newRelationshipProp] = graphNode[nowRelationshipProp]
          delete graphNode[nowRelationshipProp]
          write('update', graphNode.props.id, graphNode)
        }
      }
    }

    // update relationship_IdsKey
    const newRelationship_IdsKey = getRelationship_IdsKey(newName)
    write('update', newRelationship_IdsKey, relationship_Ids)
    write('delete', relationship_IdsKey)

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

    doneSchemaUpdate(isSourceSchemaPush)
  }
}
