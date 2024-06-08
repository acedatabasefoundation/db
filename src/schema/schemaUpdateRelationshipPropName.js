import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'
import { getRelationshipIdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateRelationshipPropName } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateRelationshipPropName (reqItem) {
  for (const { relationship, nowName, newName } of reqItem.how.props) {
    if (!Memory.txn.schema?.relationships?.[relationship]) throw AceError('aceFn__schemaUpdateRelationshipPropName__invalidRelationship', `Please ensure that when updating a relationship prop name the relationship is defined in the schema, this is not happening yet for the relationship: ${ relationship }`, { relationship, nowName, newName })
    if (!Memory.txn.schema?.relationships[relationship]?.props?.[nowName]) throw AceError('aceFn__schemaUpdateRelationshipPropName__invalidProp', `Please ensure that when updating a relationship prop name the prop is defined in the schema, this is not happening yet for the relationship: ${ relationship } and the prop: ${ nowName }`, { relationship, nowName, newName })

    /** @type { (string | number)[] } Update prop on each graphRelationship */
    const relationshipIds = await getOne(getRelationshipIdsKey(relationship))

    if (relationshipIds.length) {
      /** @type { td.AceGraphRelationship[] } */
      const graphRelationships = await getMany(relationshipIds)

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
      doneSchemaUpdate()
    }
  }
}
