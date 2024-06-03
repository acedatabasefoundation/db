import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { inupNode } from './mutate/inupNode.js'
import { emptyMemory } from '../empty/emptyMemory.js'
import { addToSchema } from '../schema/addToSchema.js'
import { updateNodeName } from '../schema/updateNodeName.js'
import { deleteNodesById } from './mutate/deleteNodesById.js'
import { inupRelationship } from './mutate/inupRelationship.js'
import { queryNode, queryRelationship } from './query/query.js'
import { deleteNodesByName } from '../schema/deleteNodesByName.js'
import { updateNodePropName } from '../schema/updateNodePropName.js'
import { deleteNodePropsById } from './mutate/deleteNodePropsById.js'
import { deleteNodePropsByName } from '../schema/deleteNodePropsByName.js'
import { updateRelationshipName } from '../schema/updateRelationshipName.js'
import { deleteRelationshipsBy_Ids } from './mutate/deleteRelationshipsBy_Ids.js'
import { updateRelationshipPropName } from '../schema/updateRelationshipPropName.js'
import { deleteRelationshipPropsById } from './mutate/deleteRelationshipPropsById.js'


/**
 * @param { td.AceFnRequestItem[] } req 
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnCryptoJWKs } jwks 
 */
export async function deligate (req, res, jwks) {
  for (let iReq = 0; iReq < req.length; iReq++) {
    switch (req[iReq].do) {
      case 'Empty':
        emptyMemory()
        break


      case 'NodeQuery':
        await queryNode(res, jwks, iReq, /** @type { td.AceQueryRequestItemNode } */(req[iReq]))
        break


      case 'RelationshipQuery':
        await queryRelationship(res, jwks, iReq, /** @type { td.AceQueryRequestItemRelationship } */(req[iReq]))
        break


      case 'SchemaGet':
        res.now[/** @type { td.AceQueryRequestItemSchemaGet } */(req[iReq]).how] = Memory.txn.schema
        break


      case 'SchemaAdd':
        addToSchema(/** @type { td.AceMutateRequestItemSchemaAdd } */(req[iReq]))
        break


      case 'NodeInsert':
      case 'NodeUpdate':
      case 'NodeUpsert':
        await inupNode(jwks, /** @type { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate } */(req[iReq]))
        break


      case 'RelationshipInsert':
      case 'RelationshipUpdate':
      case 'RelationshipUpsert':
        await inupRelationship(/** @type { td.AceMutateRequestItemRelationshipInsert | td.AceMutateRequestItemRelationshipUpdate } */(req[iReq]))
        break


      case 'NodeDeleteData':
        await deleteNodesById(/** @type { { how: (string|number)[] } } */(req[iReq]).how)
        break


      case 'RelationshipDeleteData':
        await deleteRelationshipsBy_Ids(/** @type { td.AceMutateRequestItemRelationshipDeleteData } */(req[iReq]).how._ids)
        break


      case 'NodePropDeleteData':
        await deleteNodePropsById(/** @type { td.AceMutateRequestItemNodePropDeleteData } */(req[iReq]))
        break


      case 'RelationshipPropDeleteData':
        await deleteRelationshipPropsById(/** @type { td.AceMutateRequestItemRelationshipPropDeleteData } */(req[iReq]))
        break


      case 'NodeDeleteDataAndDeleteFromSchema':
        await deleteNodesByName(/** @type { td.AceMutateRequestItemNodeDeleteDataAndDeleteFromSchema } */(req[iReq]))
        break


      case 'NodePropDeleteDataAndDeleteFromSchema':
        await deleteNodePropsByName(/** @type { td.AceMutateRequestItemNodePropDeleteDataAndDeleteFromSchema } */(req[iReq]))
        break


      case 'SchemaUpdateNodeName':
        await updateNodeName(/** @type { td.AceMutateRequestItemSchemaUpdateNodeName } */(req[iReq]))
        break


      case 'SchemaUpdateNodePropName':
        await updateNodePropName(/** @type { td.AceMutateRequestItemSchemaUpdateNodePropName } */(req[iReq]))
        break


      case 'SchemaUpdateRelationshipName':
        await updateRelationshipName(/** @type { td.AceMutateRequestItemSchemaUpdateRelationshipName } */(req[iReq]))
        break


      case 'SchemaUpdateRelationshipPropName':
        await updateRelationshipPropName(/** @type { td.AceMutateRequestItemSchemaUpdateRelationshipPropName } */(req[iReq]))
        break
    }
  }
}
