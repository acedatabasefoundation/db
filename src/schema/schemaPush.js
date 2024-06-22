import { td } from '#ace'
import { setSchema } from './setSchema.js'
import { readFile } from 'node:fs/promises'
import { Memory } from '../objects/Memory.js'
import { doesPathExist } from '../util/file.js'
import { AceError } from '../objects/AceError.js'
import { setSchemaFlag } from './setSchemaFlag.js'
import { schemaRenameNode } from './schemaRenameNode.js'
import { schemaDeleteNodes } from './schemaDeleteNodes.js'
import { schemaRenameNodeProp } from './schemaRenameNodeProp.js'
import { schemaDeleteNodeProps } from './schemaDeleteNodeProps.js'
import { schemaUpdateNodePropHas } from './schemaUpdateNodePropHas.js'
import { schemaUpdatePropDefault } from './schemaUpdatePropDefault.js'
import { schemaRenameRelationship } from './schemaRenameRelationship.js'
import { SchemaDataStructures } from '../objects/SchemaDataStructures.js'
import { schemaDeleteRelationships } from './schemaDeleteRelationships.js'
import { schemaUpdatePropSortIndex } from './schemaUpdatePropSortIndex.js'
import { schemaUpdateNodePropCascade } from './schemaUpdateNodePropCascade.js'
import { schemaUpdatePropUniqueIndex } from './schemaUpdatePropUniqueIndex.js'
import { schemaRenameRelationshipProp } from './schemaRenameRelationshipProp.js'
import { schemaDeleteRelationshipProps } from './schemaDeleteRelationshipProps.js'
import { schemaUpdatePropMustBeDefined } from './schemaUpdatePropMustBeDefined.js'


/**
 * @param { td.AceFnOptions } options
 * @param { td.AceMutateRequestItemSchemaPush } reqItem
 * @returns { Promise<void> }
 */
export async function schemaPush (options, reqItem) {
  if (!Memory.txn.env) throw AceError('schemaPush__missingEnv', 'Please ensure Memory.txn.env is a truthy when calling schemaPush()', {})
  if (typeof reqItem.how !== 'number' || reqItem.how < 1) throw AceError('schemaPush__invalidVersion', 'Please ensure that when pushing a schema, a "version" is provided as a number greater then 0 to ace() @ options.req.how. Example options: { req: { how: 2 } } ', { how: reqItem.how })

  // when doing a schema push, ensure the schema is fresh
  Memory.txn.schemaNowDetails = undefined
  Memory.txn.schemaOriginalDetails = undefined
  const paths = await setSchema(options)

  let nowId = /** @type { td.AceSchemaDetail } */(/** @type { * } */(Memory.txn.schemaNowDetails?.[ Memory.txn.env ]))?.nowId || 0

  if (nowId === 0) await pushFromZero(paths, reqItem) 
  else if (nowId !== reqItem.how) await pushNotFromZero(paths, nowId, reqItem.how)

  setSchemaFlag('schemaPushRequested')
  setSchemaNowDetails(Memory.txn.env, reqItem)
}


/**
 * @param { td.AceFilePaths } paths 
 * @param { td.AceMutateRequestItemSchemaPush } reqItem
 * @returns { Promise<void> }
 */
async function pushFromZero (paths, reqItem) {
  if (Memory.txn.schema || Memory.txn.schemaUpdated) throw AceError('schemaPush__alsoUpdatingSchema', 'Please ensure the same transaction does not update a schema and then push a schema. Please first push the schema to the correct version and then update the schema.', {})

  const schema = await getSchema(paths, reqItem.how)
  Memory.txn.schema = schema
  Memory.txn.schemaDataStructures = SchemaDataStructures(schema)
}


/**
 * @param { td.AceFilePaths } paths 
 * @param { number } nowId 
 * @param { number } aimId 
 * @returns { Promise<void> }
 */
async function pushNotFromZero (paths, nowId, aimId) {
  const schemas = new Map()
  const range = getRange(nowId, aimId)

  for (const toId of range) {
    await addToSchemasMap(paths, toId, nowId, schemas)

    const { schema: toSchema, schemaDataStructures: toSchemaDataStructures } = schemas.get(toId)
    const { schema: fromSchema, schemaDataStructures: fromSchemaDataStructures } = schemas.get(nowId)

    if (toSchema && fromSchema && toSchemaDataStructures && fromSchemaDataStructures) {
      // update relationships first b/c when a relationship deletes a relationship or a relationship prop all the related Node/Relationship props get deleted too
      // if a node prop is deleted it can leave around an adjacent relationship prop which can then throw an error when validateSchema.js is run b/c the delete prop ran
      for (const [ aceId, { relationship: fromRelationship, prop: fromProp } ] of fromSchemaDataStructures.byAceId) {
        if (fromRelationship) await updateRelationship(aceId, toSchemaDataStructures, fromSchema, toSchema, fromRelationship, fromProp)
      }

      for (const [ aceId, { node: fromNode, prop: fromProp } ] of fromSchemaDataStructures.byAceId) {
        if (fromNode) await updateNode(aceId, toSchemaDataStructures, fromSchema, toSchema, fromNode, fromProp)
      }
    }
  }
}


/**
 * @param { td.AceFilePaths } paths 
 * @param { number } schemaId 
 * @returns { Promise<td.AceSchema> }
 */
async function getSchema (paths, schemaId) {
  const schemaPath = paths.schemas + '/' + schemaId + '.json'

  if (!await doesPathExist(schemaPath)) throw AceError('schemaPush__missingVersion', `Please ensure [ options.dir ]/schemas/${ schemaId }.json exists, so schema push can work`, { missingVersion: schemaId })

  const str = await readFile(paths.schemas + '/' + schemaId + '.json', 'utf-8')

  if (!str) throw AceError('schemaPush__emptyVersion', `Please ensure [ options.dir ]/schemas/${ schemaId }.json has a schema in it, so schema push can work`, { missingVersion: schemaId })

  return JSON.parse(str)
}


/**
 * @param { td.AceFilePaths } paths 
 * @param { number } toId 
 * @param { number } fromId 
 * @param { Map<number, { schema: td.AceSchema, schemaDataStructures: td.AceTxnSchemaDataStructures }> } schemas 
 * @returns { Promise<void> }
 */
async function addToSchemasMap (paths, toId, fromId, schemas) {
  const toMapValue = schemas.get(toId)
  const fromMapValue = schemas.get(fromId)

  let toSchema = toMapValue?.schema
  let toSchemaDataStructures = toMapValue?.schemaDataStructures

  let fromSchema = fromMapValue?.schema
  let fromSchemaDataStructures = fromMapValue?.schemaDataStructures

  if (!toSchema && !fromSchema) {
    const toPath = paths.schemas + '/' + toId + '.json'
    const fromPath = paths.schemas + '/' + fromId + '.json'

    const [ toDoesExist, fromDoesExist ] = await Promise.all([ doesPathExist(toPath), doesPathExist(fromPath) ])

    if (!toDoesExist) throw AceError('schemaPush__missingVersion', `Please ensure [ options.dir ]/schemas/${ toId }.json exists, so schema push can work`, { missingVersion: toId })
    if (!fromDoesExist) throw AceError('schemaPush__missingVersion', `Please ensure [ options.dir ]/schemas/${ fromId }.json exists, so schema push can work`, { missingVersion: fromId })

    const [ toStr, fromStr ] = await Promise.all([
      readFile(toPath, 'utf-8'),
      readFile(fromPath, 'utf-8')
    ])
  
    if (!toStr) throw AceError('schemaPush__missingVersion', `Please ensure [ options.dir ]/schemas/${ toId }.json exists, so schema push can work`, { missingVersion: toId })
    if (!fromStr) throw AceError('schemaPush__missingVersion', `Please ensure [ options.dir ]/schemas/${ fromId }.json exists, so schema push can work`, { missingVersion: fromId })

    toSchema = /** @type { td.AceSchema } */(JSON.parse(toStr))
    fromSchema = /** @type { td.AceSchema } */(JSON.parse(fromStr))

    toSchemaDataStructures = SchemaDataStructures(toSchema)
    fromSchemaDataStructures = SchemaDataStructures(fromSchema)

    schemas.set(toId, { schema: toSchema, schemaDataStructures: toSchemaDataStructures })
    schemas.set(fromId, { schema: fromSchema, schemaDataStructures: fromSchemaDataStructures })
  } else if (!toSchema) {
    toSchema = await getSchema(paths, toId)
    toSchemaDataStructures = SchemaDataStructures(toSchema)
    schemas.set(toId, { schema: toSchema, schemaDataStructures: toSchemaDataStructures })
  } else if (!fromSchema) {
    fromSchema = await getSchema(paths, fromId)
    fromSchemaDataStructures = SchemaDataStructures(fromSchema)
    schemas.set(fromId, { schema: fromSchema, schemaDataStructures: fromSchemaDataStructures })
  }
}


/**
 * @param { number } aceId 
 * @param { td.AceTxnSchemaDataStructures } toSchemaDataStructures 
 * @param { td.AceSchema } fromSchema 
 * @param { td.AceSchema } toSchema 
 * @param { string } [ fromRelationship ]
 * @param { string } [ fromProp ]
 */
async function updateRelationship (aceId, toSchemaDataStructures, fromSchema, toSchema, fromRelationship, fromProp) {
  if (fromRelationship) {
    const toInfo = toSchemaDataStructures.byAceId.get(aceId)

    if (!fromProp) { // relationship (not relationship prop) update      
      // delete relationship
      if (!toInfo) await schemaDeleteRelationships({ do: 'SchemaDeleteRelationships', how: [ /** @type { td.AceMutateRequestItemSchemaDeleteRelationshipsItem } */(fromRelationship)] }, true)
      else {
        // rename relationship
        if (toInfo.relationship && toInfo.relationship !== fromRelationship) await schemaRenameRelationship({ do: 'SchemaRenameRelationship', how: [/** @type { td.AceMutateRequestItemSchemaRenameRelationshipItem } */({ nowName: fromRelationship, newName: toInfo.relationship })] }, true)
      }
    } else if (toSchema.relationships?.[fromRelationship]) { // no need to update the prop if the relationship is deleted
      // delete relationship props
      if (!toInfo) await schemaDeleteRelationshipProps({ do: 'SchemaDeleteRelationshipProps',  how: [ /** @type { td.AceMutateRequestItemSchemaDeleteRelationshipPropsItem } */({ relationship: fromRelationship, prop: fromProp }) ] }, true)
      else if (toInfo.relationship && toInfo.prop) {
        // rename relationship prop
        if (toInfo.prop && toInfo.prop !== fromProp) await schemaRenameRelationshipProp({ do: 'SchemaRenameRelationshipProp', how: [ /** @type { td.AceMutateRequestItemSchemaRenameRelationshipPropItem } */({ relationship: fromRelationship, nowName: fromProp, newName: toInfo.prop }) ] }, true)

        const fromPropValue = fromSchema.relationships?.[fromRelationship]?.props?.[fromProp]
        const toPropValue = toSchema.relationships?.[toInfo.relationship]?.props?.[toInfo.prop]

        // update prop default
        if (fromPropValue?.options.default !== toPropValue?.options.default) await schemaUpdatePropDefault({ do: 'SchemaUpdatePropDefault', how: [ /** @type { td.AceMutateRequestItemSchemaUpdatePropDefaultItem } */({ nodeOrRelationship: toInfo.relationship, prop: toInfo.prop, default: toPropValue?.options.default })] }, true)

        // update prop must be defined
        if (fromPropValue?.options.mustBeDefined !== toPropValue?.options.mustBeDefined) await schemaUpdatePropMustBeDefined({ do: 'SchemaUpdatePropMustBeDefined', how: [ /** @type { td.AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem } */({ nodeOrRelationship: toInfo.relationship, prop: toInfo.prop, mustBeDefined: toPropValue?.options.mustBeDefined || false })] }, true)

        // update prop sort index
        if (fromPropValue?.options.sortIndex !== toPropValue?.options.sortIndex) await schemaUpdatePropSortIndex({ do: 'SchemaUpdatePropSortIndex', how: [ /** @type { td.AceMutateRequestItemSchemaUpdatePropSortIndexItem } */({ nodeOrRelationship: toInfo.relationship, prop: toInfo.prop, sortIndex: toPropValue?.options.sortIndex || false })] }, true)

        // update prop unique index
        if (fromPropValue?.options.sortIndex !== toPropValue?.options.sortIndex) await schemaUpdatePropUniqueIndex({ do: 'SchemaUpdatePropUniqueIndex', how: [ /** @type { td.AceMutateRequestItemSchemaUpdatePropUniqueIndexItem } */({ nodeOrRelationship: toInfo.relationship, prop: toInfo.prop, uniqueIndex: toPropValue?.options.uniqueIndex || false })] }, true)
      }
    }
  }
}


/**
 * @param { number } aceId 
 * @param { td.AceTxnSchemaDataStructures } toSchemaDataStructures 
 * @param { td.AceSchema } fromSchema 
 * @param { td.AceSchema } toSchema 
 * @param { string } [ fromNode ]
 * @param { string } [ fromProp ]
 */
async function updateNode (aceId, toSchemaDataStructures, fromSchema, toSchema, fromNode, fromProp) {
  if (fromNode) {
    const toInfo = toSchemaDataStructures.byAceId.get(aceId)

    if (!fromProp) { // node (not node prop) update  
      // delete node
      if (!toInfo) await schemaDeleteNodes({ do: 'SchemaDeleteNodes', how: [ /** @type { td.AceMutateRequestItemSchemaDeleteNodesItem } */(fromNode)] }, true)
      else {
        // rename node
        if (toInfo.node && toInfo.node !== fromNode) await schemaRenameNode({ do: 'SchemaRenameNode', how: [ /** @type { td.AceMutateRequestItemSchemaRenameNodeItem } */({ nowName: fromNode, newName: toInfo.node })] }, true)
      }
    } else if (!toInfo && fromSchema.nodes?.[fromNode]?.[fromProp]?.is !== 'Prop') {
      // no need to update the prop if this prop is deleted and it is a relationship prop, b/c updateRelationship() will get rid of this prop
    } else if (!toSchema.nodes?.[fromNode]) {
      // no need to update the prop if the node is deleted
    } else {
      // delete node prop
      if (!toInfo) await schemaDeleteNodeProps({ do: 'SchemaDeleteNodeProps', how: [ /** @type { td.AceMutateRequestItemSchemaDeleteNodePropsItem } */({ node: fromNode, prop: fromProp })] }, true)
      else if (toInfo.node && toInfo.prop) {
        // rename node prop
        if (toInfo.prop !== fromProp) await schemaRenameNodeProp({ do: 'SchemaRenameNodeProp', how: [ /** @type { td.AceMutateRequestItemSchemaRenameNodePropItem } */({ node: fromNode, nowName: fromProp, newName: toInfo.prop })] }, true)

        const fromPropValue = fromSchema.nodes[fromNode][fromProp]
        const toPropValue = toSchema.nodes[toInfo.node][toInfo.prop]

        // update prop must be defined
        if (fromPropValue.options.mustBeDefined !== toPropValue.options.mustBeDefined) await schemaUpdatePropMustBeDefined({ do: 'SchemaUpdatePropMustBeDefined', how: [ /** @type { td.AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem } */({ nodeOrRelationship: toInfo.node, prop: toInfo.prop, mustBeDefined: toPropValue.options.mustBeDefined || false })] }, true)

        if (fromPropValue.is === 'Prop' && toPropValue.is === 'Prop') {
          // update prop default
          if (fromPropValue.options.default !== toPropValue.options.default) await schemaUpdatePropDefault({ do: 'SchemaUpdatePropDefault', how: [ /** @type { td.AceMutateRequestItemSchemaUpdatePropDefaultItem } */({ nodeOrRelationship: toInfo.node, prop: toInfo.prop, default: toPropValue.options.default })] }, true)

          // update prop sort index
          if (fromPropValue.options.sortIndex !== toPropValue.options.sortIndex) await schemaUpdatePropSortIndex({ do: 'SchemaUpdatePropSortIndex', how: [ /** @type { td.AceMutateRequestItemSchemaUpdatePropSortIndexItem } */({ nodeOrRelationship: toInfo.node, prop: toInfo.prop, sortIndex: toPropValue.options.sortIndex || false })] }, true)

          // update prop unique index
          if (fromPropValue.options.sortIndex !== toPropValue.options.sortIndex) await schemaUpdatePropUniqueIndex({ do: 'SchemaUpdatePropUniqueIndex', how: [ /** @type { td.AceMutateRequestItemSchemaUpdatePropUniqueIndexItem } */({ nodeOrRelationship: toInfo.node, prop: toInfo.prop, uniqueIndex: toPropValue.options.uniqueIndex || false })] }, true)
        } else if (fromPropValue.is !== 'Prop' && toPropValue.is !== 'Prop') {
          // update prop cascade
          if (fromPropValue.options.cascade !== toPropValue.options.cascade && typeof toPropValue.options.cascade === 'boolean') await schemaUpdateNodePropCascade({ do: 'SchemaUpdateNodePropCascade', how: [ /** @type { td.AceMutateRequestItemSchemaUpdateNodePropCascadeItem } */({ node: toInfo.node, prop: toInfo.prop, cascade: toPropValue.options.cascade })] }, true)

          // update prop has
          if (fromPropValue.options.has !== toPropValue.options.has) await schemaUpdateNodePropHas({ do: 'SchemaUpdateNodePropHas', how: [ /** @type { td.AceMutateRequestItemSchemaUpdateNodePropHasItem } */({ node: toInfo.node, prop: toInfo.prop, has: toPropValue.options.has })] }, true)
        }
      }
    } 
  }
}


/**
 * @param { string } env 
 * @param { td.AceMutateRequestItemSchemaPush } reqItem
 * @returns { void }
 */
function setSchemaNowDetails (env, reqItem) {
  if (!Memory.txn.schemaNowDetails) Memory.txn.schemaNowDetails = { [ env ]: { nowId: reqItem.how, lastId: reqItem.how } }
  else if (!Memory.txn.schemaNowDetails[ env ]) Memory.txn.schemaNowDetails[ env ] = { nowId: reqItem.how, lastId: reqItem.how }
  else {
    Memory.txn.schemaNowDetails[ env ].nowId = reqItem.how
    Memory.txn.schemaNowDetails[ env ].lastId = reqItem.how
  }
}


/**
 * @param { number } start 
 * @param { number } end 
 * @returns { number[] }
 */
function getRange (start, end) {
  let res = []

  if (start < end) { // ascending
    for (let i = start + 1; i <= end; i++) {
      res.push(i)
    }
  } else { // descending
    for (let i = start - 1; i >= end; i--) {
      res.push(i)
    }
  }

  return res
}
