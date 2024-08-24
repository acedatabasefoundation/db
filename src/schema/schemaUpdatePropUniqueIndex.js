import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getOne, getMany } from '../util/storage.js'
import { getNodeIdsKey, getRelationship_IdsKey, getUniqueIndexKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdatePropUniqueIndex } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaUpdatePropUniqueIndex (reqItem, isSourceSchemaPush) {
  let schemaUpdated = false

  /** @type { Map<string, { type: 'add' | 'remove', howItem: td.AceMutateRequestItemSchemaUpdatePropUniqueIndexItem }[]> } Map<nodeName, { reqProp, type }[]>  */
  const propsByNode = new Map()

  /** @type { Map<string, { type: 'add' | 'remove', howItem: td.AceMutateRequestItemSchemaUpdatePropUniqueIndexItem }[]> } Map<relationshipName, { reqProp, type }[]>  */
  const propsByRelationship = new Map()

  for (let i = 0; i < reqItem.how.length; i++) {
    const schemaProp = Memory.txn.schema?.nodes[reqItem.how[i].nodeOrRelationship]?.[reqItem.how[i].prop] || Memory.txn.schema?.relationships?.[reqItem.how[i].nodeOrRelationship]?.props?.[reqItem.how[i].prop]

    // validate reqItem
    if (!schemaProp) throw new AceError('schemaUpdatePropUniqueIndex__invalidReq', `Please ensure when attempting to update node or relationship "uniqueIndex", the node or relationship and prop are defined in your schema. This is not happening yet for the node or relationship: "${ reqItem.how[i].nodeOrRelationship }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: reqItem.how[i] })
    if (typeof reqItem.how[i].uniqueIndex !== 'boolean') throw new AceError('schemaUpdatePropUniqueIndex__invalidType', `Please ensure when attempting to update node or relationship "uniqueIndex", the typeof reqItemProp.uniqueIndex is "boolean". This is not happening yet for the node or relationship: "${ reqItem.how[i].nodeOrRelationship }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: reqItem.how[i] })
    if (schemaProp.is !== 'Prop' && schemaProp.is !== 'RelationshipProp') throw new AceError('schemaUpdatePropUniqueIndex__invalidProp', `Please ensure when attempting to node or relationship "uniqueIndex", schemaProp.is is "Prop" or "RelationshipProp". This is not happening yet for the node or relationship: "${ reqItem.how[i].nodeOrRelationship }" and prop: "${ reqItem.how[i].prop }"`, { reqItemProp: reqItem.how[i] })
  
    if (schemaProp.options.uniqueIndex && !reqItem.how[i].uniqueIndex) { // remove uniqueIndex
      schemaUpdated = true
      delete schemaProp.options.uniqueIndex
      addToMaps('remove', schemaProp, propsByNode, propsByRelationship, reqItem.how[i])
    } else if (!schemaProp.options.uniqueIndex && reqItem.how[i].uniqueIndex) { // add uniqueIndex
      schemaUpdated = true
      schemaProp.options.uniqueIndex = true
      addToMaps('add', schemaProp, propsByNode, propsByRelationship, reqItem.how[i])
    }
  }

  // update schema nodes
  for (const [ nodeName, props ] of propsByNode) {
    const nodeIdsKey = getNodeIdsKey(nodeName)
    const allNodeIds = /** @type { undefined | td.AceGraphIndex } */ (await getOne(nodeIdsKey))

    if (Array.isArray(allNodeIds?.index)) {
      const graphNodes = /** @type { td.AceGraphNode[] } */ (await getMany(allNodeIds.index))

      for (let i = 0; i < graphNodes.length; i++) {
        if (graphNodes[i]) {
          for (let j = 0; i < props.length; j++) {
            if (typeof graphNodes[i]?.props[props[j].howItem.prop] !== 'undefined') {
              switch (props[j].type) {
                case 'add':
                  write({
                    $aA: 'upsert',
                    index: graphNodes[i].$aK,
                    $aK: getUniqueIndexKey(props[j].howItem.nodeOrRelationship, props[j].howItem.prop, graphNodes[i][props[j].howItem.prop]),
                  })
                  break
                case 'remove':
                  write({
                    $aA: 'delete',
                    $aK: getUniqueIndexKey(props[j].howItem.nodeOrRelationship, props[j].howItem.prop, graphNodes[i][props[j].howItem.prop]),
                  })
                  break
              }
            }
          }
        }
      }
    }
  }

  // update schema relationships
  for (const [ relationshipName, props ] of propsByRelationship) {
    const relationship_IdsKey = getRelationship_IdsKey(relationshipName)
    const allRelationship_Ids = /** @type { td.AceGraphIndex | undefined } */ (await getOne(relationship_IdsKey))

    if (Array.isArray(allRelationship_Ids?.index)) {
      const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(allRelationship_Ids.index))

      for (let i = 0; i < graphRelationships.length; i++) {
        for (let j = 0; j < props.length; j++) {
          if (typeof graphRelationships[i].props[props[j].howItem.prop] !== 'undefined') {
            switch (props[j].type) {
              case 'add':
                write({
                  $aA: 'upsert',
                  index: graphRelationships[i].$aK,
                  $aK: getUniqueIndexKey(props[j].howItem.nodeOrRelationship, props[j].howItem.prop, graphRelationships[i].props[props[j].howItem.prop])
                })
                break
              case 'remove':
                write({
                  $aA: 'delete',
                  index: graphRelationships[i].$aK,
                  $aK: getUniqueIndexKey(props[j].howItem.nodeOrRelationship, props[j].howItem.prop, graphRelationships[i].props[props[j].howItem.prop]),
                })
                break
            }
          }
        }
      }
    }
  }

  if (schemaUpdated) doneSchemaUpdate(isSourceSchemaPush)
}


/**
 * @param { 'add' | 'remove' } type 
 * @param { td.AceSchemaProp | td.AceSchemaRelationshipProp } schemaProp 
 * @param { Map<string, { type: 'add' | 'remove', howItem: td.AceMutateRequestItemSchemaUpdatePropUniqueIndexItem }[]> } propsByNode 
 * @param { Map<string, { type: 'add' | 'remove', howItem: td.AceMutateRequestItemSchemaUpdatePropUniqueIndexItem }[]> } propsByRelationship 
 * @param { td.AceMutateRequestItemSchemaUpdatePropUniqueIndexItem } howItem 
 */
function addToMaps (type, schemaProp, propsByNode, propsByRelationship, howItem) {
  if (schemaProp.is === 'Prop') { // add to propsByNode
    const nodeProps = propsByNode.get(howItem.nodeOrRelationship) || []
    nodeProps.push({ howItem, type })
    propsByNode.set(howItem.nodeOrRelationship, nodeProps)
  } else { // add to propsByRelationship
    const relationshipProps = propsByRelationship.get(howItem.nodeOrRelationship) || []
    relationshipProps.push({ howItem, type })
    propsByRelationship.set(howItem.nodeOrRelationship, relationshipProps)
  }
}
