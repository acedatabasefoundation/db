import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getMany, getOne } from '../util/storage.js'
import { validatePropValue } from '../util/validatePropValue.js'
import { getNodeIdsKey, getRelationship_IdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdatePropDefault } reqItem
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { Promise<void> }
 */
export async function schemaUpdatePropDefault (reqItem, isSourceSchemaPush) {
  let schemaUpdated = false

  /** @type { Map<string, td.AceMutateRequestItemSchemaUpdatePropDefaultItem[]> } Map<nodeName, reqProp[]>  */
  const propsByNode = new Map()

  /** @type { Map<string, td.AceMutateRequestItemSchemaUpdatePropDefaultItem[]> } Map<relationshipName, reqProp[]>  */
  const propsByRelationship = new Map()

  for (let i = 0; i < reqItem.how.length; i++) {
    const schemaProp = Memory.txn.schema?.nodes[reqItem.how[i].nodeOrRelationship]?.[reqItem.how[i].prop] || Memory.txn.schema?.relationships?.[reqItem.how[i].nodeOrRelationship]?.props?.[reqItem.how[i].prop]


    // validate
    if (!schemaProp) throw new AceError('schemaUpdatePropDefault__invalidReq', `Please ensure when attempting to update node or relationship prop default, the node or relationship and prop are defined in your schema. This is not happening yet for the node or relationship: ${ reqItem.how[i].nodeOrRelationship } and prop: ${ reqItem.how[i].prop }`, { reqItemProp: reqItem.how[i] })
    if (schemaProp.is !== 'Prop' && schemaProp.is !== 'RelationshipProp') throw new AceError('schemaUpdatePropDefault__invalidProp', `Please ensure when attempting to update node or relationship prop default, the prop or relationship has an "is" in your schema of "Prop" or "RelationshipProp". This is not happening yet for the node or relationship: ${ reqItem.how[i].nodeOrRelationship } and prop: ${ reqItem.how[i].prop }`, { reqItemProp: reqItem.how[i] })
    if (typeof reqItem.how[i].default !== 'undefined') validatePropValue(reqItem.how[i].prop, reqItem.how[i].default, schemaProp.options.dataType, reqItem.how[i].nodeOrRelationship, 'node or relationship', 'schemaUpdatePropDefault', { reqItemProp: reqItem.how[i] })


    // add to propsByNode || add to propsByRelationship
    if (typeof schemaProp.options.default === 'undefined' && typeof reqItem.how[i].default !== 'undefined') {
      if (schemaProp.is === 'Prop') {
        const props = propsByNode.get(reqItem.how[i].nodeOrRelationship) || []
        props.push(reqItem.how[i])
        propsByNode.set(reqItem.how[i].nodeOrRelationship, props)
      } else {
        const props = propsByRelationship.get(reqItem.how[i].nodeOrRelationship) || []
        props.push(reqItem.how[i])
        propsByRelationship.set(reqItem.how[i].nodeOrRelationship, props)
      }
    }


    // update schema
    if (typeof reqItem.how[i].default !== 'undefined') {
      schemaUpdated = true
      schemaProp.options.default = reqItem.how[i].default
    } else if (typeof schemaProp.options.default !== 'undefined') {
      schemaUpdated = true
      delete schemaProp.options.default
    }
  }


  // update schema nodes
  for (const [ nodeName, props ] of propsByNode) {
    const nodeIdsKey = getNodeIdsKey(nodeName);
    const allNodeIds = /** @type { td.AceGraphIndex | undefined } */ (await getOne(nodeIdsKey));

    if (Array.isArray(allNodeIds?.index)) {
      const graphNodes = /** @type { td.AceGraphNode[] } */ (await getMany(allNodeIds.index));

      for (let i = 0; i < graphNodes.length; i++) {
        if (graphNodes[i]) {
          let propUpdated = false

          for (let j = 0; j < props.length; j++) {
            if (typeof graphNodes[i][props[j].prop] === 'undefined') {
              propUpdated = true
              schemaUpdated = true
              graphNodes[i].props[props[j].prop] = props[j].default
            }
          }

          if (propUpdated) {
            graphNodes[i].$aA = 'update'
            write(graphNodes[i])
          }
        }
      }
    }
  }


  // update schema relationships
  for (const [ relationshipName, props ] of propsByRelationship) {
    const relationship_IdsKey = getRelationship_IdsKey(relationshipName);
    const allRelationship_Ids = /** @type { td.AceGraphIndex | undefined } */ (await getOne(relationship_IdsKey));

    if (Array.isArray(allRelationship_Ids?.index)) {
      const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(allRelationship_Ids.index))

      for (let i = 0; i < graphRelationships.length; i++) {
        let propUpdated = false

        for (let j = 0; j < props.length; j++) {
          if (typeof graphRelationships[i][props[j].prop] === 'undefined') {
            propUpdated = true
            schemaUpdated = true
            graphRelationships[i][props[j].prop] = props[j].default
          }
        }

        if (propUpdated) {
          graphRelationships[i].$aA = 'update'
          write(graphRelationships[i])
        }
      }
    }
  }


  if (schemaUpdated) doneSchemaUpdate(isSourceSchemaPush)
}
