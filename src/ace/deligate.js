import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { inupNode } from './mutate/inupNode.js'
import { emptyMemory } from '../empty/emptyMemory.js'
import { addToSchema } from '../schema/addToSchema.js'
import { deleteNodesById } from './mutate/deleteNodesById.js'
import { inupRelationship } from './mutate/inupRelationship.js'
import { queryNode, queryRelationship } from './query/query.js'
import { schemaDeleteNodes } from '../schema/schemaDeleteNodes.js'
import { deleteNodePropsById } from './mutate/deleteNodePropsById.js'
import { schemaUpdateNodeName } from '../schema/schemaUpdateNodeName.js'
import { schemaDeleteNodeProps } from '../schema/schemaDeleteNodeProps.js'
import { schemaUpdateNodePropHas } from '../schema/schemaUpdateNodePropHas.js'
import { schemaUpdateNodePropName } from '../schema/schemaUpdateNodePropName.js'
import { deleteRelationshipsBy_Ids } from './mutate/deleteRelationshipsBy_Ids.js'
import { deleteRelationshipPropsById } from './mutate/deleteRelationshipPropsById.js'
import { schemaUpdateRelationshipName } from '../schema/schemaUpdateRelationshipName.js'
import { schemaUpdateRelationshipPropName } from '../schema/schemaUpdateRelationshipPropName.js'


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


      case 'NodeDelete':
        await deleteNodesById(/** @type { { how: (string|number)[] } } */(req[iReq]).how)
        break


      case 'RelationshipDelete':
        await deleteRelationshipsBy_Ids(/** @type { td.AceMutateRequestItemRelationshipDelete } */(req[iReq]).how._ids)
        break


      case 'NodePropDelete':
        await deleteNodePropsById(/** @type { td.AceMutateRequestItemNodePropDelete } */(req[iReq]))
        break


      case 'RelationshipPropDelete':
        await deleteRelationshipPropsById(/** @type { td.AceMutateRequestItemRelationshipPropDelete } */(req[iReq]))
        break


      case 'SchemaDeleteNodes':
        await schemaDeleteNodes(/** @type { td.AceMutateRequestItemSchemaDeleteNodes } */(req[iReq]))
        break


      case 'SchemaDeleteNodeProps':
        await schemaDeleteNodeProps(/** @type { td.AceMutateRequestItemSchemaDeleteNodeProps } */(req[iReq]))
        break


      case 'SchemaUpdateNodeName':
        await schemaUpdateNodeName(/** @type { td.AceMutateRequestItemSchemaUpdateNodeName } */(req[iReq]))
        break


      case 'SchemaUpdateNodePropName':
        await schemaUpdateNodePropName(/** @type { td.AceMutateRequestItemSchemaUpdateNodePropName } */(req[iReq]))
        break


      case 'SchemaUpdateNodePropHas':
        await schemaUpdateNodePropHas(/** @type { td.AceMutateRequestItemSchemaUpdateNodePropHas } */(req[iReq]))
        break


      case 'SchemaUpdateRelationshipName':
        await schemaUpdateRelationshipName(/** @type { td.AceMutateRequestItemSchemaUpdateRelationshipName } */(req[iReq]))
        break


      case 'SchemaUpdateRelationshipPropName':
        await schemaUpdateRelationshipPropName(/** @type { td.AceMutateRequestItemSchemaUpdateRelationshipPropName } */(req[iReq]))
        break
    }
  }
}
