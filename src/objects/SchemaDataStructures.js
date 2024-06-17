import { td } from '#ace'
import { DELIMITER, SCHEMA_ID } from '../util/variables.js'


/**
 * @param { td.AceSchema | null } schema
 * @returns { td.AceTxnSchemaDataStructures }
 */
export function SchemaDataStructures (schema) {
  /** @type { td.AceTxnSchemaDataStructures } */
  const schemaDataStructures = {
    cascade: new Map(),
    byAceId: new Map(),
    defaults: new Map(),
    mustPropsMap: new Map(),
    relationshipPropsMap: new Map(),
    nodeRelationshipPropsMap: new Map(),
    nodeNamePlusRelationshipNameToNodePropNameMap: new Map(),
  }

  if (schema?.nodes) {
    for (const nodeName in schema.nodes) {
      schemaDataStructures.byAceId.set(schema.nodes[nodeName].$aceId, { node: nodeName })

      for (const propName in schema.nodes[nodeName]) {
        if (propName !== SCHEMA_ID) {
          const propValue = schema.nodes[nodeName][propName]

          schemaDataStructures.byAceId.set(propValue.$aceId, { node: nodeName, prop: propName })
  
          if (propValue.is === 'Prop') setDefaults(schemaDataStructures, nodeName, propName, propValue) // defaults
          else {
            schemaDataStructures.nodeNamePlusRelationshipNameToNodePropNameMap.set(nodeName + DELIMITER + propValue.options.relationship, propName)

            // relationshipPropsMap
            const mapValue = schemaDataStructures.relationshipPropsMap.get(propValue.options.relationship) || new Map()
            mapValue.set(propName, { propNode: nodeName, propValue })
            schemaDataStructures.relationshipPropsMap.set(propValue.options.relationship, mapValue)

            // cascade
            if (propValue.options.cascade) {
              const set = schemaDataStructures.cascade.get(nodeName) || new Set()
              set.add(propName)
              schemaDataStructures.cascade.set(nodeName, set)
            }

            // nodeRelationshipPropsMap
            if (propValue.options.node) {
              const set = schemaDataStructures.nodeRelationshipPropsMap.get(propValue.options.node) || new Set()
              set.add(nodeName + DELIMITER + propName + DELIMITER + propValue.options.relationship)
              schemaDataStructures.nodeRelationshipPropsMap.set(propValue.options.node, set)
            }
          }

          // mustPropsMap
          setMustPropsMap(schemaDataStructures, nodeName, propName, propValue)
        }
      }
    }
  }

  if (schema?.relationships) {
    for (const relationshipName in schema.relationships) {
      schemaDataStructures.byAceId.set(schema.relationships[relationshipName].$aceId, { relationship: relationshipName })

      if (!schemaDataStructures.mustPropsMap) schemaDataStructures.mustPropsMap = new Map()

      const props = schema.relationships[relationshipName]?.props

      if (props) {
        for (const propName in props) {
          setMustPropsMap(schemaDataStructures, relationshipName, propName, props[propName]) // mustPropsMap
          setDefaults(schemaDataStructures, relationshipName, propName, props[propName]) // defaults
          schemaDataStructures.byAceId.set(props[propName].$aceId, { relationship: relationshipName, prop: propName })
        }
      }
    }
  }

  return schemaDataStructures
}


/**
 * @param { td.AceTxnSchemaDataStructures } schemaDataStructures 
 * @param { string } itemName 
 * @param { string } propName 
 * @param { td.AceSchemaProp | td.AceSchemaRelationshipProp } propValue 
 */
function setDefaults (schemaDataStructures, itemName, propName, propValue) {
  if (propValue.options?.default) {
    const defaults = schemaDataStructures.defaults.get(itemName) || []

    if (propValue.options.dataType === 'iso' && propValue.options.default === 'now') defaults.push({ prop: propName, do: 'setIsoNow' })
    else defaults.push({ prop: propName, value: propValue.options.default })

    schemaDataStructures.defaults.set(itemName, defaults)
  }
}


/**
 * @param { td.AceTxnSchemaDataStructures } schemaDataStructures 
 * @param { string } itemName 
 * @param { string } propName 
 * @param { td.AceSchemaProp | td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp | td.AceSchemaRelationshipProp } propValue 
 */
function setMustPropsMap (schemaDataStructures, itemName, propName, propValue) {
  if (propValue.options?.mustBeDefined) {
    const map = schemaDataStructures.mustPropsMap.get(itemName) || new Map()
    map.set(propName, propValue)
    schemaDataStructures.mustPropsMap.set(itemName, map)
  }
}


/**
 * @param { td.AceTxnSchemaDataStructures } schemaDataStructures 
 * @param { string } itemName 
 * @param { string } propName 
 * @param { td.AceSchemaProp | td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp | td.AceSchemaRelationshipProp } propValue 
 */
function setByAceId (schemaDataStructures, itemName, propName, propValue) {
  if (propValue.options?.mustBeDefined) {
    const map = schemaDataStructures.mustPropsMap.get(itemName) || new Map()
    map.set(propName, propValue)
    schemaDataStructures.mustPropsMap.set(itemName, map)
  }
}
