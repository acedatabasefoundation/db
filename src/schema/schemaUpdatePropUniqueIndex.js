import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'
import { getNodeIdsKey, getRelationshipIdsKey, getUniqueIndexKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdatePropUniqueIndex } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdatePropUniqueIndex (reqItem) {
  let schemaUpdated = false

  /** @type { Map<string, { type: 'add' | 'remove', prop: td.AceMutateRequestItemSchemaUpdatePropUniqueIndexProp }[]> } Map<nodeName, { reqProp, type }[]>  */
  const propsByNode = new Map()

  /** @type { Map<string, { type: 'add' | 'remove', prop: td.AceMutateRequestItemSchemaUpdatePropUniqueIndexProp }[]> } Map<relationshipName, { reqProp, type }[]>  */
  const propsByRelationship = new Map()

  for (const prop of reqItem.how.props) {
    const schemaProp = Memory.txn.schema?.nodes[prop.nodeOrRelationship]?.[prop.prop] || Memory.txn.schema?.relationships?.[prop.nodeOrRelationship]?.props?.[prop.prop]

    // validate reqItem
    if (!schemaProp) throw AceError('aceFn__schemaUpdatePropUniqueIndex__invalidReq', `Please ensure when attempting to update node or relationship "uniqueIndex", the node or relationship and prop are defined in your schema. This is not happening yet for the node or relationship: "${ prop.nodeOrRelationship }" and prop: "${ prop.prop }"`, { reqItemProp: prop })
    if (typeof prop.uniqueIndex !== 'boolean') throw AceError('aceFn__schemaUpdatePropUniqueIndex__invalidType', `Please ensure when attempting to update node or relationship "uniqueIndex", the typeof reqItemProp.uniqueIndex is "boolean". This is not happening yet for the node or relationship: "${ prop.nodeOrRelationship }" and prop: "${ prop.prop }"`, { reqItemProp: prop })
    if (schemaProp.is !== 'Prop' && schemaProp.is !== 'RelationshipProp') throw AceError('aceFn__schemaUpdatePropUniqueIndex__invalidProp', `Please ensure when attempting to node or relationship "uniqueIndex", schemaProp.is is "Prop" or "RelationshipProp". This is not happening yet for the node or relationship: "${ prop.nodeOrRelationship }" and prop: "${ prop.prop }"`, { reqItemProp: prop })
  
    if (schemaProp.options.uniqueIndex && !prop.uniqueIndex) { // remove uniqueIndex
      schemaUpdated = true
      delete schemaProp.options.uniqueIndex
      addToMaps('remove', schemaProp, propsByNode, propsByRelationship, prop)
    } else if (!schemaProp.options.uniqueIndex && prop.uniqueIndex) { // add uniqueIndex
      schemaUpdated = true
      schemaProp.options.uniqueIndex = true
      addToMaps('add', schemaProp, propsByNode, propsByRelationship, prop)
    }
  }

  // update schema nodes
  for (const [ nodeName, props ] of propsByNode) {
    const nodeIdsKey = getNodeIdsKey(nodeName)

    /** @type { (string | number)[] } */
    const allNodeIds = await getOne(nodeIdsKey)

    if (Array.isArray(allNodeIds)) {
      /** @type { Map<string | number, td.AceGraphNode> } */
      const graphNodes = await getMany(allNodeIds)

      for (const entry of graphNodes) {
        for (const { prop: reqProp, type } of props) {
          if (typeof entry[1].props[reqProp.prop] !== 'undefined') {
            switch (type) {
              case 'add':
                write('upsert', getUniqueIndexKey(reqProp.nodeOrRelationship, reqProp.prop, entry[1].props[reqProp.prop]), entry[0])
                break
              case 'remove':
                write('delete', getUniqueIndexKey(reqProp.nodeOrRelationship, reqProp.prop, entry[1].props[reqProp.prop]), entry[0])
                break
            }
          }
        }
      }
    }
  }

  // update schema relationships
  for (const [ relationshipName, props ] of propsByRelationship) {
    const relationshipIdsKey = getRelationshipIdsKey(relationshipName)

    /** @type { (string | number)[] } */
    const allRelationshipIds = await getOne(relationshipIdsKey)

    if (Array.isArray(allRelationshipIds)) {
      /** @type { Map<string | number, td.AceGraphRelationship> } */
      const graphRelationships = await getMany(allRelationshipIds)

      for (const entry of graphRelationships) {
        for (const { prop: reqProp, type } of props) {
          if (typeof entry[1].props[reqProp.prop] !== 'undefined') {
            switch (type) {
              case 'add':
                write('upsert', getUniqueIndexKey(reqProp.nodeOrRelationship, reqProp.prop, entry[1].props[reqProp.prop]), entry[0])
                break
              case 'remove':
                write('delete', getUniqueIndexKey(reqProp.nodeOrRelationship, reqProp.prop, entry[1].props[reqProp.prop]), entry[0])
                break
            }
          }
        }
      }
    }
  }

  if (schemaUpdated) doneSchemaUpdate()
}


/**
 * @param { 'add' | 'remove' } type 
 * @param { td.AceSchemaProp | td.AceSchemaRelationshipProp } schemaProp 
 * @param { Map<string, { type: 'add' | 'remove', prop: td.AceMutateRequestItemSchemaUpdatePropUniqueIndexProp }[]> } propsByNode 
 * @param { Map<string, { type: 'add' | 'remove', prop: td.AceMutateRequestItemSchemaUpdatePropUniqueIndexProp }[]> } propsByRelationship 
 * @param { td.AceMutateRequestItemSchemaUpdatePropUniqueIndexProp } prop 
 */
function addToMaps (type, schemaProp, propsByNode, propsByRelationship, prop) {
  if (schemaProp.is === 'Prop') { // add to propsByNode
    const nodeProps = propsByNode.get(prop.nodeOrRelationship) || []
    nodeProps.push({ prop, type })
    propsByNode.set(prop.nodeOrRelationship, nodeProps)
  } else { // add to propsByRelationship
    const relationshipProps = propsByRelationship.get(prop.nodeOrRelationship) || []
    relationshipProps.push({ prop, type })
    propsByRelationship.set(prop.nodeOrRelationship, relationshipProps)
  }
}
