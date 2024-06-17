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
  for (const { relationship, nowName, newName } of reqItem.how) {
    if (!Memory.txn.schema?.relationships?.[relationship]) throw AceError('schemaRenameRelationshipProp__invalidRelationship', `Please ensure that when updating a relationship prop name the relationship is defined in the schema, this is not happening yet for the relationship: ${ relationship }`, { relationship, nowName, newName })
    if (!Memory.txn.schema?.relationships[relationship]?.props?.[nowName]) throw AceError('schemaRenameRelationshipProp__invalidProp', `Please ensure that when updating a relationship prop name the prop is defined in the schema, this is not happening yet for the relationship: ${ relationship } and the prop: ${ nowName }`, { relationship, nowName, newName })

    /** @type { (string | number)[] } Update prop on each graphRelationship */
    const relationship_Ids = await getOne(getRelationship_IdsKey(relationship))

    if (relationship_Ids?.length) {
      /** @type { td.AceGraphRelationship[] } */
      const graphRelationships = await getMany(relationship_Ids)

      for (const graphRelationship of graphRelationships) {
        if (typeof graphRelationship.props[nowName] !== 'undefined') {
          graphRelationship.props[newName] = graphRelationship.props[nowName]
          delete graphRelationship.props[nowName]
          write('update', graphRelationship.props._id, graphRelationship)
        }
      }
    }

    // update schema
    const props = Memory.txn.schema.relationships[relationship].props

    if (props) {
      props[newName] = props[nowName]
      delete props[nowName]
      doneSchemaUpdate(isSourceSchemaPush)
    }
  }
}
