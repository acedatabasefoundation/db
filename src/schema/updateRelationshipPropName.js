import { td } from '#ace'
import { doneUpdate } from './doneUpdate.js'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { write, getMany, getOne } from '../util/storage.js'
import { getRelationshipIdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateRelationshipPropName } reqItem
 * @returns { Promise<void> }
 */
export async function updateRelationshipPropName (reqItem) {
  for (const { relationship, nowName, newName } of reqItem.how.props) {
    if (!Memory.txn.schema?.relationships?.[relationship]) throw AceError('aceFn__updateRelationshipPropName__invalidRelationship', `Please ensure that when updating a relationship prop name the relationship is defined in the schema, this is not happening yet for the relationship: ${ relationship }`, { relationship, nowName, newName })
    if (!Memory.txn.schema?.relationships[relationship]?.props?.[nowName]) throw AceError('aceFn__updateRelationshipPropName__invalidProp', `Please ensure that when updating a relationship prop name the prop is defined in the schema, this is not happening yet for the relationship: ${ relationship } and the prop: ${ nowName }`, { relationship, nowName, newName })

    /** @type { (string | number)[] } Update prop on each graphRelationship */
    const relationshipIds = await getOne(getRelationshipIdsKey(relationship))

    if (relationshipIds.length) {
      /** @type { Map<string | number, td.AceGraphRelationship> } */
      const graphRelationships = await getMany(relationshipIds)

      for (const entry of graphRelationships) {
        if (typeof entry[1].props[nowName] !== 'undefined') {
          entry[1].props[newName] = entry[1].props[nowName]
          delete entry[1].props[nowName]
          write('update', entry[0], entry[1])
        }
      }
    }

    // update schema
    const props = Memory.txn.schema.relationships[relationship].props

    if (props) {
      props[newName] = props[nowName]
      delete props[nowName]
      doneUpdate()
    }
  }
}
