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
  for (let i = 0; i < reqItem.how.length; i++) {
    // const relationship = reqItem.how[i].relationship
    // const prop = /** @type { string } */(reqItem.how[i].prop)
    const schemaProps = Memory.txn.schema?.relationships?.[reqItem.how[i].relationship]?.props

    if (!schemaProps?.[reqItem.how[i].prop]) throw new AceError('schemaDeleteRelationshipProps__notInSchema', `Pleae ensure that when you'd love to delete a prop, the relationship and prop are defined in your schema, this is not happening yet with relationship: "${ reqItem.how[i].relationship }" and prop: "${ reqItem.how[i].prop }" for the reqItem:`, { reqItem, relationship: reqItem.how[i].relationship, prop: reqItem.how[i].prop })
    if (reqItem.how[i].prop === '_id') throw new AceError('schemaDeleteRelationshipProps__noDelete_Id', `Pleae ensure that when you'd love to delete a prop, the prop is not "_id", this is not happening yet for the reqItem:`, { reqItem, relationship: reqItem.how[i].relationship, prop: reqItem.how[i].prop })
    if (reqItem.how[i].prop === 'a') throw new AceError('schemaDeleteRelationshipProps__noDeleteA', `Pleae ensure that when you'd love to delete a prop, the prop is not "a", this is not happening yet for the reqItem:`, { reqItem, relationship: reqItem.how[i].relationship, prop: reqItem.how[i].prop })
    if (reqItem.how[i].prop === 'b') throw new AceError('schemaDeleteRelationshipProps__noDeleteB', `Pleae ensure that when you'd love to delete a prop, the prop is not "b", this is not happening yet for the reqItem:`, { reqItem, relationship: reqItem.how[i].relationship, prop: reqItem.how[i].prop })

    const relationship_IdsKey = getRelationship_IdsKey(reqItem.how[i].relationship)
    const relationship_Ids =/** @type { td.AceGraphIndex | undefined } */ ( await getOne(relationship_IdsKey))

    if (Array.isArray(relationship_Ids?.index)) {
      const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(relationship_Ids.index));

      for (let i = 0; i < graphRelationships.length; i++) {
        if (typeof graphRelationships[i][reqItem.how[i].prop] !== 'undefined') {
          delete graphRelationships[i][reqItem.how[i].prop]
          graphRelationships[i].$aA = 'update'
          write(graphRelationships[i])
        }
      }
    }

    delete schemaProps[reqItem.how[i].prop]
    doneSchemaUpdate(isSourceSchemaPush)
  }
}
