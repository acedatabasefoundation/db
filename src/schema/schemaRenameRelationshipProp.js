import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'
import { getRelationship_IdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaRenameRelationshipProp } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaRenameRelationshipProp (reqItem, isSourceSchemaPush) {
  for (let i = 0; i < reqItem.how.length; i++) {
    if (!Memory.txn.schema?.relationships?.[reqItem.how[i].relationship]) throw new AceError('schemaRenameRelationshipProp__invalidRelationship', `Please ensure that when updating a relationship prop name the relationship is defined in the schema, this is not happening yet for the relationship: ${ reqItem.how[i].relationship }`, { relationship: reqItem.how[i].relationship, nowName: reqItem.how[i].nowName, newName: reqItem.how[i].newName })
    if (!Memory.txn.schema?.relationships[reqItem.how[i].relationship]?.props?.[reqItem.how[i].nowName]) throw new AceError('schemaRenameRelationshipProp__invalidProp', `Please ensure that when updating a relationship prop name the prop is defined in the schema, this is not happening yet for the relationship: ${ reqItem.how[i].relationship } and the prop: ${ reqItem.how[i].nowName }`, { relationship: reqItem.how[i].relationship, nowName: reqItem.how[i].nowName, newName: reqItem.how[i].newName })

    const relationship_Ids = /** @type { td.AceGraphIndex | undefined } Update prop on each graphRelationship */ (await getOne(getRelationship_IdsKey(reqItem.how[i].relationship)))

    if (Array.isArray(relationship_Ids?.index)) {
      const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(relationship_Ids.index));

      for (let j = 0; j < graphRelationships.length; j++) {
        if (typeof graphRelationships[j]?.props[reqItem.how[i].nowName] !== 'undefined') {
          graphRelationships[j][reqItem.how[i].newName] = graphRelationships[j][reqItem.how[i].nowName]
          graphRelationships[j].$aA = 'update'
          delete graphRelationships[j][reqItem.how[i].nowName]
          write(graphRelationships[j])
        }
      }
    }

    // update schema
    const props = Memory.txn.schema.relationships[reqItem.how[i].relationship].props

    if (props) {
      props[reqItem.how[i].newName] = props[reqItem.how[i].nowName]
      delete props[reqItem.how[i].nowName]
      doneSchemaUpdate(isSourceSchemaPush)
    }
  }
}
