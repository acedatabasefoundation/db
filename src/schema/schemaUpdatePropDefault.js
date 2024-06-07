import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doneSchemaUpdate } from './doneSchemaUpdate.js'
import { write, getMany, getOne } from '../util/storage.js'
import { validatePropValue } from '../util/validatePropValue.js'
import { getNodeIdsKey, getRelationshipIdsKey } from '../util/variables.js'


/** 
 * @param { td.AceMutateRequestItemSchemaUpdatePropDefault } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdatePropDefault (reqItem) {
  let schemaUpdated = false

  /** @type { Map<string, td.AceMutateRequestItemSchemaUpdatePropDefaultProp[]> } Map<nodeName, reqProp[]>  */
  const propsByNode = new Map()

  /** @type { Map<string, td.AceMutateRequestItemSchemaUpdatePropDefaultProp[]> } Map<relationshipName, reqProp[]>  */
  const propsByRelationship = new Map()

  for (const prop of reqItem.how.props) {
    const schemaProp = Memory.txn.schema?.nodes[prop.nodeOrRelationship]?.[prop.prop] || Memory.txn.schema?.relationships?.[prop.nodeOrRelationship]?.props?.[prop.prop]


    // validate reqItem
    if (!schemaProp) throw AceError('aceFn__schemaUpdatePropDefault__invalidReq', `Please ensure when attempting to update node or relationship prop default, the node or relationship and prop are defined in your schema. This is not happening yet for the node or relationship: ${ prop.nodeOrRelationship } and prop: ${ prop.prop }`, { reqItemProp: prop })
    if (schemaProp.is !== 'Prop' && schemaProp.is !== 'RelationshipProp') throw AceError('aceFn__schemaUpdatePropDefault__invalidProp', `Please ensure when attempting to update node or relationship prop default, the prop or relationship has an "is" in your schema of "Prop" or "RelationshipProp". This is not happening yet for the node or relationship: ${ prop.nodeOrRelationship } and prop: ${ prop.prop }`, { reqItemProp: prop })
    if (typeof prop.default !== 'undefined') validatePropValue(prop.prop, prop.default, schemaProp.options.dataType, prop.nodeOrRelationship, 'node or relationship', 'schemaUpdatePropDefault', { reqItemProp: prop })


    // add to propsByNode || add to propsByRelationship
    if (typeof schemaProp.options.default === 'undefined' && typeof prop.default !== 'undefined') {
      if (schemaProp.is === 'Prop') {
        const props = propsByNode.get(prop.nodeOrRelationship) || []
        props.push(prop)
        propsByNode.set(prop.nodeOrRelationship, props)
      } else {
        const props = propsByRelationship.get(prop.nodeOrRelationship) || []
        props.push(prop)
        propsByRelationship.set(prop.nodeOrRelationship, props)
      }
    }


    // update schema
    if (typeof prop.default !== 'undefined') {
      schemaUpdated = true
      schemaProp.options.default = prop.default
    } else if (typeof schemaProp.options.default !== 'undefined') {
      schemaUpdated = true
      delete schemaProp.options.default
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
        let propUpdated = false

        for (const reqProp of props) {
          if (typeof entry[1].props[reqProp.prop] === 'undefined') {
            propUpdated = true
            schemaUpdated = true
            entry[1].props[reqProp.prop] = reqProp.default
          }
        }

        if (propUpdated) write('update', entry[0], entry[1])
      }
    }
  }


  // update schema relationships
  for (const [ relationshipName, props ] of propsByRelationship) {
    const relationshipIdsKey = getRelationshipIdsKey(relationshipName)

    /** @type { (string | number)[] } */
    const allRelationshipIds = await getOne(relationshipIdsKey)

    if (Array.isArray(allRelationshipIds)) {
      /** @type { Map<string | number, td.AceGraphNode> } */
      const graphRelationships = await getMany(allRelationshipIds)

      for (const entry of graphRelationships) {
        let propUpdated = false

        for (const reqProp of props) {
          if (typeof entry[1].props[reqProp.prop] === 'undefined') {
            propUpdated = true
            schemaUpdated = true
            entry[1].props[reqProp.prop] = reqProp.default
          }
        }

        if (propUpdated) write('update', entry[0], entry[1])
      }
    }
  }


  if (schemaUpdated) doneSchemaUpdate()
}
