import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'
import { getRelationship_IdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaDeleteRelationshipProps } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaDeleteRelationshipProps (reqItem, isSourceSchemaPush) {
  for (const item of reqItem.how) {
    const relationship = item.relationship
    const prop = /** @type { string } */(item.prop)
    const schemaProps = Memory.txn.schema?.relationships?.[relationship]?.props

    if (!schemaProps?.[prop]) throw AceError('schemaDeleteRelationshipProps__notInSchema', `Pleae ensure that when you'd love to delete a prop, the relationship and prop are defined in your schema, this is not happening yet with relationship: "${ relationship }" and prop: "${ prop }" for the reqItem:`, { reqItem, relationship, prop })
    if (prop === '_id') throw AceError('schemaDeleteRelationshipProps__noDelete_Id', `Pleae ensure that when you'd love to delete a prop, the prop is not "_id", this is not happening yet for the reqItem:`, { reqItem, relationship, prop })
    if (prop === 'a') throw AceError('schemaDeleteRelationshipProps__noDeleteA', `Pleae ensure that when you'd love to delete a prop, the prop is not "a", this is not happening yet for the reqItem:`, { reqItem, relationship, prop })
    if (prop === 'b') throw AceError('schemaDeleteRelationshipProps__noDeleteB', `Pleae ensure that when you'd love to delete a prop, the prop is not "b", this is not happening yet for the reqItem:`, { reqItem, relationship, prop })

    const relationship_IdsKey = getRelationship_IdsKey(relationship)

    /** @type { (string | number)[] } */
    const relationship_Ids = await getOne(relationship_IdsKey)

    if (relationship_Ids?.length) {
      /** @type {td.AceGraphRelationship[] } */
      const graphRelationships = await getMany(relationship_Ids)

      for (const graphRelationship of graphRelationships) {
        if (typeof graphRelationship.props[prop] !== 'undefined') {
          delete graphRelationship.props[prop]
          write('update', graphRelationship.props._id, graphRelationship)
        }
      }
    }

    delete schemaProps[prop]
    doneSchemaUpdate(isSourceSchemaPush)
  }
}
