import { td } from '#ace'
import { inupNode } from './mutate/inupNode.js'
import { emptyTrash } from '../empty/emptyTrash.js'
import { schemaPush } from '../schema/schemaPush.js'
import { addToSchema } from '../schema/addToSchema.js'
import { Memory, onEmpty } from '../objects/Memory.js'
import { deleteNodes } from './mutate/deleteNodes.js'
import { deleteNodeProps } from './mutate/deleteNodeProps.js'
import { inupRelationship } from './mutate/inupRelationship.js'
import { queryNode, queryRelationship } from './query/query.js'
import { schemaRenameNode } from '../schema/schemaRenameNode.js'
import { schemaDeleteNodes } from '../schema/schemaDeleteNodes.js'
import { deleteRelationships } from './mutate/deleteRelationships.js'
import { schemaRenameNodeProp } from '../schema/schemaRenameNodeProp.js'
import { schemaDeleteNodeProps } from '../schema/schemaDeleteNodeProps.js'
import { deleteRelationshipProps } from './mutate/deleteRelationshipProps.js'
import { schemaUpdatePropDefault } from '../schema/schemaUpdatePropDefault.js'
import { schemaUpdateNodePropHas } from '../schema/schemaUpdateNodePropHas.js'
import { schemaRenameRelationship } from '../schema/schemaRenameRelationship.js'
import { schemaUpdatePropSortIndex } from '../schema/schemaUpdatePropSortIndex.js'
import { schemaUpdateNodePropCascade } from '../schema/schemaUpdateNodePropCascade.js'
import { schemaUpdatePropUniqueIndex } from '../schema/schemaUpdatePropUniqueIndex.js'
import { schemaRenameRelationshipProp } from '../schema/schemaRenameRelationshipProp.js'
import { schemaUpdatePropMustBeDefined } from '../schema/schemaUpdatePropMustBeDefined.js'


/**
 * @param { td.AceFnOptions } options
 * @param { td.AceFnRequestItem[] } req 
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnCryptoJWKs } jwks 
 */
export async function deligate (options, req, res, jwks) {
  for (let iReq = 0; iReq < req.length; iReq++) {
    switch (req[iReq].do) {
      case 'EmptyGraph':
        onEmpty()
        break


      case 'EmptyTrash':
        emptyTrash(options)
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


      case 'SchemaPush':
        await schemaPush(options, /** @type { td.AceMutateRequestItemSchemaPush } */(req[iReq]))
        break


      case 'NodeInsert':
      case 'NodeUpdate':
      case 'NodeUpsert':
        await inupNode(jwks, /** @type { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate } */(req[iReq]))
        break


      case 'RelationshipInsert':
      case 'RelationshipUpdate':
      case 'RelationshipUpsert':
        await inupRelationship(jwks, /** @type { td.AceMutateRequestItemRelationshipInsert | td.AceMutateRequestItemRelationshipUpdate } */(req[iReq]))
        break


      case 'NodeDelete':
        await deleteNodes(/** @type { { how: (string|number)[] } } */(req[iReq]).how)
        break


      case 'RelationshipDelete':
        await deleteRelationships(/** @type { td.AceMutateRequestItemRelationshipDelete } */(req[iReq]).how._ids)
        break


      case 'NodePropDelete':
        await deleteNodeProps(/** @type { td.AceMutateRequestItemNodePropDelete } */(req[iReq]))
        break


      case 'RelationshipPropDelete':
        await deleteRelationshipProps(/** @type { td.AceMutateRequestItemRelationshipPropDelete } */(req[iReq]))
        break


      case 'SchemaDeleteNodes':
        await schemaDeleteNodes(/** @type { td.AceMutateRequestItemSchemaDeleteNodes } */(req[iReq]))
        break


      case 'SchemaDeleteNodeProps':
        await schemaDeleteNodeProps(/** @type { td.AceMutateRequestItemSchemaDeleteNodeProps } */(req[iReq]))
        break


      case 'SchemaRenameNode':
        await schemaRenameNode(/** @type { td.AceMutateRequestItemSchemaRenameNode } */(req[iReq]))
        break


      case 'SchemaRenameNodeProp':
        await schemaRenameNodeProp(/** @type { td.AceMutateRequestItemSchemaRenameNodeProp } */(req[iReq]))
        break


      case 'SchemaUpdateNodePropHas':
        await schemaUpdateNodePropHas(/** @type { td.AceMutateRequestItemSchemaUpdateNodePropHas } */(req[iReq]))
        break


      case 'SchemaUpdateNodePropCascade':
        await schemaUpdateNodePropCascade(/** @type { td.AceMutateRequestItemSchemaUpdateNodePropCascade } */(req[iReq]))
        break


      case 'SchemaRenameRelationship':
        await schemaRenameRelationship(/** @type { td.AceMutateRequestItemSchemaRenameRelationship } */(req[iReq]))
        break


      case 'SchemaRenameRelationshipProp':
        await schemaRenameRelationshipProp(/** @type { td.AceMutateRequestItemSchemaRenameRelationshipProp } */(req[iReq]))
        break


      case 'SchemaUpdatePropDefault':
        await schemaUpdatePropDefault(/** @type { td.AceMutateRequestItemSchemaUpdatePropDefault } */(req[iReq]))
        break


      case 'SchemaUpdatePropMustBeDefined':
        await schemaUpdatePropMustBeDefined(/** @type { td.AceMutateRequestItemSchemaUpdatePropMustBeDefined } */(req[iReq]))
        break


      case 'SchemaUpdatePropSortIndex':
        await schemaUpdatePropSortIndex(/** @type { td.AceMutateRequestItemSchemaUpdatePropSortIndex } */(req[iReq]))
        break


      case 'SchemaUpdatePropUniqueIndex':
        await schemaUpdatePropUniqueIndex(/** @type { td.AceMutateRequestItemSchemaUpdatePropUniqueIndex } */(req[iReq]))
        break
    }
  }
}
