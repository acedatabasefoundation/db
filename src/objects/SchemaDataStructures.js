import { td } from '#ace'
import { DELIMITER, SCHEMA_ID } from '../util/variables.js'


/**
 * @param { td.AceSchema | null } schema
 * @returns { td.AceTxnSchemaDataStructures }
 */
export function SchemaDataStructures (schema) {
  /** @type { td.AceTxnSchemaDataStructures } */
  const schemaDataStructures = {
    defaults: new Map(),
    cascade: new Map(),
    mustPropsMap: new Map(),
    relationshipPropsMap: new Map(),
    nodeRelationshipPropsMap: new Map(),
    nodeNamePlusRelationshipNameToNodePropNameMap: new Map(),
  }

  if (schema?.nodes) {
    for (const nodeName in schema.nodes) {
      for (const propName in schema.nodes[nodeName]) {
        if (propName !== SCHEMA_ID) {
          const propValue = schema.nodes[nodeName][propName]
  
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
              set.add(nodeName + DELIMITER + propName)
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
      if (!schemaDataStructures.mustPropsMap) schemaDataStructures.mustPropsMap = new Map()

      const props = schema.relationships[relationshipName]?.props

      if (props) {
        for (const propName in props) {
          setMustPropsMap(schemaDataStructures, relationshipName, propName, props[propName]) // mustPropsMap
          setDefaults(schemaDataStructures, relationshipName, propName, props[propName]) // defaults
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

    if (propValue.options.dataType === 'isoString' && propValue.options.default === 'now') defaults.push({ prop: propName, action: 'setIsoNow' })
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
