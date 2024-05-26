import { td, enums } from '#ace'
import { DELIMITER } from '../util/variables.js'


/**
 * @param { td.AceSchema | null } schema
 * @returns { td.AceTxnSchemaDataStructures }
 */
export function SchemaDataStructures (schema) {
  /** @type { td.AceTxnSchemaDataStructures } */
  const schemaDataStructures = {
    cascade: new Map(),
    mustPropsMap: new Map(),
    relationshipPropsMap: new Map(),
    nodeRelationshipPropsMap: new Map(),
    nodeNamePlusRelationshipNameToNodePropNameMap: new Map(),
  }

  if (schema?.nodes) {
    for (const nodeName in schema.nodes) {
      for (const propName in schema.nodes[nodeName]) {
        const propValue = schema.nodes[nodeName][propName]

        if (propValue.is !== 'Prop') {
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
        if (propValue.options?.mustBeDefined) {
          const map = schemaDataStructures.mustPropsMap.get(nodeName) || new Map()
          map.set(propName, propValue)
          schemaDataStructures.mustPropsMap.set(nodeName, map)
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
          // mustPropsMap
          if (props[propName].options?.mustBeDefined) {
            const map = schemaDataStructures.mustPropsMap.get(relationshipName) || new Map()
            map.set(propName, props[propName])
            schemaDataStructures.mustPropsMap.set(relationshipName, map)
          }
        }
      }
    }
  }

  return schemaDataStructures
}
