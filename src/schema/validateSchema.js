import { td, enums } from '#ace'
import { AceError } from '../objects/AceError.js'
import { DELIMITER, SCHEMA_ID } from '../util/variables.js'
import { isObjectPopulated } from '../util/isObjectPopulated.js'


/**
 * Validate Schema
 * @param { td.AceSchema } schema
 */
export function validateSchema (schema) {
  if (!isObjectPopulated(schema?.nodes)) throw AceError('schema__invalidNodes', 'Please ensure the provided schema includes a nodes object with props', {})
  if (schema.relationships && (typeof schema.relationships !== 'object' || Array.isArray(schema.relationships))) throw AceError('schema__invalidRelationships', 'Please ensure the provided schema has relationships as an object if you would love to include relationships', {})
  if (typeof schema.lastId !== 'number') throw AceError('schema__missingLastId', 'Please ensure each schema has a lastId', {})

  /** @type { Set<string> } - Helps ensure each node in `schema.nodes` is unique */
  const nodeNameSet = new Set()

  /** @type { Set<string> } - Add relationships to this set as we loop `relationshipNameArray` - Ensures `relationshipName` is unique */
  const relationshipNameSet = new Set()

  /** @type { Set<string> } - Add relationships to this set as we loop `schema.nodes[nodeName]` - Ensures each nodeName in a prop points to a node defined in the schema */
  const relationshipPropNodeNameSet = new Set()

  /** @type { string[] } - Helpful so we may loop the relationships in the schema */
  const relationshipNameArray = Object.keys(schema.relationships || {})

  /** @type { Map<string, Set<string>> } - `Map<nodeName, Set<nodePropName>>` - Ensures each `nodePropName` is a unique `nodeName` */
  const uniqueNodePropsMap = new Map()

  /** @type { Map<string, Set<string>> } - `Map<relationshipName, Set<propName>>` - Ensures each `relationshipPropName` at a `relationshipName` is unique */
  const uniqueRelationshipPropsMap = new Map()

  /** @type { Map<string, td.AceSchemaDirectionsMapDirection[]> } - `Map<relationshipName, [{ nodeName, nodePropName, id }]>` - Helps ensure relationships defined in `schema.relationships` have required and properly formatted nodes props in `schema.nodes` */
  const directionsMap = new Map()

  /** @type { Set<number> } Each id will go in here to ensure we do not have duplicate ids */
  const aceIdSet = new Set()

  for (const nodeName in schema.nodes) {
    if (nodeNameSet.has(nodeName)) throw AceError('schema__notUniqueNodeName', `Please ensure each node name is unique when updating the schema, this is not happening yet for the node name ${ nodeName }`, { nodeName })

    nodeNameSet.add(nodeName)

    if (typeof nodeName !== 'string') throw AceError('schema__invalidNodeType', `Please ensure each node name is a string when updating the schema, this is not happening yet for the node name: ${ nodeName } is an invalid type, please add node that is a type of string`, { nodeName })
    if (nodeName.includes(DELIMITER)) throw AceError('schema__nodeDelimeter', `Please ensure each node name does not include: ${ DELIMITER } when updating the schema, this is not happening yet for the node name: ${ nodeName }. Ace uses this delimeter within our query language`, { nodeName })
    if (nodeName.includes(' ')) throw AceError('schema__hasSpaces', `Please ensure each node name does not include any spaces when updating the schema, this is not happening yet for the node name: ${ nodeName }`, { nodeName })
    if (typeof schema.nodes[nodeName].$aceId !== 'number') throw AceError('schema__missingAceId', `Please ensure each schema node has an $aceId that is a type of "number", this is not happening yet for the node: ${ nodeName }`, { node: schema.nodes[nodeName] })
    if (aceIdSet.has(schema.nodes[nodeName].$aceId)) throw AceError('schema__duplicateAceId', `Please ensure each schema node has an $aceId that is unique, this is not happening yet for the node: ${ nodeName }`, { node: schema.nodes[nodeName] })

    aceIdSet.add(schema.nodes[nodeName].$aceId)

    for (const nodePropName in schema.nodes[nodeName]) {
      if (nodePropName !== SCHEMA_ID) {
        validateSchemaProp(nodePropName, schema.nodes[nodeName][nodePropName], false, aceIdSet)

        const prop = schema.nodes[nodeName][nodePropName]

        if (prop.is === 'Prop') {
          const mapValue = uniqueNodePropsMap.get(nodeName)

          if (!mapValue) uniqueNodePropsMap.set(nodeName, new Set([ nodePropName ]))
          else {
            if (mapValue.has(nodePropName)) throw AceError('schema__notUniqueNodePropName', `Please ensure each node name and prop name are unique when updating the schema, this is not happening yet for the node name: ${ nodeName } and prop name: ${ nodePropName }`, { nodeName, nodePropName })
            else mapValue.add(nodePropName)
          }
        } else {
          const schemaRelationshipProp = /** @type { td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp } */ (prop)
          const mapValue = directionsMap.get(schemaRelationshipProp.options.relationship)
          const arrayValue = { nodeName, nodePropName, id: schemaRelationshipProp.is }

          if (!mapValue) directionsMap.set(schemaRelationshipProp.options.relationship, [arrayValue])
          else mapValue.push(arrayValue)

          relationshipPropNodeNameSet.add(schemaRelationshipProp.options.node)
        }
      }
    }
  }

  for (const relationshipPropNodeName of relationshipPropNodeNameSet) {
    if (!nodeNameSet.has(relationshipPropNodeName)) throw AceError('schema__invalidRelationshipPropNodeName', `Please ensure each node name that is on a prop is also defined in the schema as a node. This is not happening yet for the node name: ${ relationshipPropNodeName }`, { nodeName: relationshipPropNodeName, schema })
  }

  for (const relationshipName of relationshipNameArray) {
    if (relationshipNameSet.has(relationshipName)) throw AceError('schema__notUniqueRelationshipName', `Please ensure each relationship name is unique. This is not happening yet for the relationship name ${ relationshipName }`, { relationshipName })
    if (nodeNameSet.has(relationshipName)) throw AceError('schema__notUniqueRelationshipName', `Please ensure each relationship name is not the same as any node name. This is not happening yet for the relationship name ${ relationshipName }`, { relationshipName })

    relationshipNameSet.add(relationshipName)

    const relationship = schema.relationships?.[relationshipName]
    const _errorData = { relationshipName, relationship }

    if (typeof relationshipName !== 'string') throw AceError('schema__invalidRelationshipType', `Please ensure each relationship name is of type string, this is not happening yet for the relationship name ${ relationshipName }`, _errorData)
    if (relationship?.is !== 'OneToOne' && relationship?.is !== 'ManyToMany' && relationship?.is !== 'OneToMany') throw AceError('schema__invalidRelationshipId', `Please ensure each schema.relationships[relationshipName].is is OneToOne, OneToMany or ManyToMany, this is not happenin yet for the relationship name: ${ relationshipName }`, _errorData)
    if (relationshipName.includes(DELIMITER)) throw AceError('schema__relationshipDelimeter', `Please ensure each relationship name does not include ${ DELIMITER }. This is not happening yet for the relationship name: ${ relationshipName }. Ace uses this delimeter within our query language`, { relationshipName })
    if (relationshipName.includes(' ')) throw AceError('schema__hasSpaces', `Please ensure relationship names do not includes a space, this is not happening yet for the relationship name: ${ relationshipName }`, { relationshipName })
    if (typeof relationship.$aceId !== 'number') throw AceError('schema__missingAceId', `Please ensure each schema node has an $aceId that is a type of "number", this is not happening yet for the node: ${relationshipName}`, { relationship })
    if (aceIdSet.has(relationship.$aceId)) throw AceError('schema__duplicateAceId', `Please ensure each schema node has an $aceId that is unique, this is not happening yet for the node: ${ relationshipName }`, { relationship })
    
    aceIdSet.add(relationship.$aceId)

    if (relationship.props) {
      if (!isObjectPopulated(relationship.props)) throw AceError('schema__invalidRelationshipProps', `Please ensure the relationship name: ${ relationshipName } has valid props, which means they are of type object`, _errorData)

      for (const propName in relationship.props) {
        if (propName !== SCHEMA_ID) {
          validateSchemaProp(propName, relationship.props[propName], true, aceIdSet)

          const mapValue = uniqueRelationshipPropsMap.get(relationshipName)

          if (!mapValue) uniqueRelationshipPropsMap.set(relationshipName, new Set([propName]))
          else {
            if (mapValue.has(propName)) throw AceError('schema__notUniqueRelationshipPropName', `Please ensure each prop is only defined once for each relationship in the schema. The relationship name ${ relationshipName } and the prop name ${ propName } is defined more then once in the schema`, { relationshipName, propName })
            else mapValue.add(propName)
          }
        }
      }
    }
  }

  if (relationshipNameArray.length !== directionsMap.size) throw AceError('schema__invalidRelationships', 'Please ensure all relationships in schema.nodes are also in schema.relationships', { schemaNodeRelationships: directionsMap.keys(), schemaRelationships: relationshipNameArray })

  if (relationshipNameArray.length) {
    for (const relationshipName of relationshipNameArray) {
      const directions = directionsMap.get(relationshipName)
      if (!directions) throw notify(relationshipName, directions)
      if (directions.length !== 1 && directions.length !== 2) throw notify(relationshipName, directions)
      if (directions.length === 1 && directions[0].id !== 'BidirectionalRelationshipProp') throw notify(relationshipName, directions)
      if (directions.length === 2) {
        if (directions[0].id === directions[1].id) throw notify(relationshipName, directions)
        if (directions[0].id !== 'ReverseRelationshipProp' && directions[1].id !== 'ReverseRelationshipProp') throw notify(relationshipName, directions)
        if (directions[0].id !== 'ForwardRelationshipProp' && directions[1].id !== 'ForwardRelationshipProp') throw notify(relationshipName, directions)
        if (directions[0].nodePropName === directions[1].nodePropName) throw AceError('schema__invalidRelationshipPropName', 'Please ensure prop names for a relationship are different so we may do relationship queries', { relationshipName, directions })
      }
    }
  }

  return schema
}


/**
 * @param { string } relationshipName 
 * @param { td.AceSchemaDirectionsMapDirection[] } [ directions ]
 * @returns 
 */
function notify (relationshipName, directions) {
  return AceError('schema__invalidRelationshipAlignment', `Please ensure each relationship has 1 BidirectionalRelationshipProp or 1 ForwardRelationshipProp and 1 ReverseRelationshipProp, this is not happening yet for the relationship name: ${ relationshipName }`, { relationshipName, directions })
}


/**
 * Validate Schema Prop
 * @param { string } propName
 * @param { td.AceSchemaProp | td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp | td.AceSchemaRelationshipProp } propValue
 * @param { boolean } isRelationshipProp
 * @param { Set<number> } aceIdSet
 */
function validateSchemaProp (propName, propValue, isRelationshipProp, aceIdSet) {
  validatePropName(propName, isRelationshipProp)

  if (typeof propValue.$aceId !== 'number') throw AceError('schema__missingAceId', `Please ensure each schma prop has an $aceId that is a type of "number", this is not happening yet for the prop: ${ propName }`, { propName, propValue })
  if (aceIdSet.has(propValue.$aceId)) throw AceError('schema__duplicateAceId', `Please ensure each schema prop has an $aceId that is unique, this is not happening yet for the prop: ${ propName }`, { propName, propValue })

  switch (propValue.is) {
    case 'Prop':
    case 'RelationshipProp':
      const schemaProp = /** @type { td.AceSchemaProp } */ (propValue)

      if (!schemaProp.options.dataType) throw AceError('schema__falsyDataType', `Please ensure each schema prop has a truthy data type, this is not happening yet for the schema prop: ${ propName }`, { propName, propValue })
      if (!enums.dataTypes[schemaProp.options.dataType]) throw AceError('schema__invalidDataType', `Please ensure each schema prop has a valid data type, this is not happening yet for the schema prop: ${ propName }. The valid data types are: ${ JSON.stringify(enums.dataTypes) }`, { propName, propValue, validDataTypes: enums.dataTypes })
      if (isRelationshipProp && propValue.is === 'Prop') throw AceError('schema__invalidNodePropIs', `Please ensure node props do not have an is of "SchemaRelationshipProp", this is not happening yet for the schema prop: ${ propName }`, { propName, propValue })
      break
    case 'ForwardRelationshipProp':
    case 'ReverseRelationshipProp':
    case 'BidirectionalRelationshipProp':
      const schemaRelationshipProp = /** @type { td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp } */ (propValue)

      if (isRelationshipProp) throw AceError('schema__invalidNodePropIs', `Please ensure node props do not have an is of "SchemaRelationshipProp", this is not happening yet for the schema prop: ${ propName }`, { propName, propValue })
      if (schemaRelationshipProp.options.has !== 'one' && schemaRelationshipProp.options.has !== 'many') throw AceError('schema__invalidHas', `Please ensure each schema prop that is forward, reverse, or bidirectional is one or many, this is not happening yet for the schema prop: ${ propName }`, { propName, propValue })
      if (typeof schemaRelationshipProp.options.node !== 'string' || !schemaRelationshipProp.options.node) throw AceError('schema__invalidNodeName', `Please ensure each schema prop that is forward, reverse, or bidirectional has a node defined as a truthy string, this is not happening yet for the schema prop: ${ propName }`, { propName, propValue })
      if (typeof schemaRelationshipProp.options.relationship !== 'string' || !schemaRelationshipProp.options.relationship) throw AceError('schema__invalidRelationshipName', `Please ensure each schema prop that is forward, reverse, or bidirectional has a relationship defined as a truthy string, this is not happening yet for the schema prop ${ propName }`, { propName, propValue })
      break
  }
}


/**
 * Validate Schema Prop Key
 * @param { string } prop
 * @param { boolean } isRelationshipProp
 */
function validatePropName (prop, isRelationshipProp) {
  if (typeof prop !== 'string') throw AceError('schema__validatePropName__notString', `Please ensure each prop name is a type of string, this is not happening yet for the prop: ${ prop }`, { prop })
  if (prop.includes(' ')) throw AceError('schema__validatePropName__hasSpaces', `Please ensure each prop does not have a space in it, this is not happening yet for the prop: ${ prop }`, { prop })
  if (prop.includes(DELIMITER)) throw AceError('schema__validatePropName__delimeter', `Please ensure each prop does not include the delimeter: ${ DELIMITER }, this is not happening yet for the prop: ${ prop }. Ace uses this delimeter within our query language`, { prop })

  if (isRelationshipProp) {
    if (prop === '_id') throw AceError('schema__validatePropName__relationship_Id', 'Please ensure the prop: _id is not defined in the schema, because _id is a reserved prop', { prop })
    if (prop === 'a') throw AceError('schema__validatePropName__relationshipA', 'Please ensure the prop: a is not defined in the schema, because a is a reserved prop', { prop })
    if (prop === 'b') throw AceError('schema__validatePropName__relationshipB', 'Please ensure the prop: b is not defined in the schema, because b is a reserved prop', { prop })
    if (!prop.startsWith('_')) throw AceError('schema__validatePropName__addUnderscore', `Please ensure relationship props start with an underscore, this is not happening yet for the prop: ${ prop }. This helps know what props in a query are relationship props`, { prop })
  } else {
    if (prop === 'id') throw AceError('schema__validatePropName__nodeId', 'Please ensure the prop: id is not defined in the schema, because id is a reserved prop', { prop })
    if (prop.startsWith('_')) throw AceError('schema__validatePropName__removeUnderscore', `Please ensure node props do not start with an underscore, this is not happening yet for the prop: ${ prop }. This helps know what props in a query are relationship props`, { prop })
    if (prop === '$ace') throw AceError('schema__validatePropName__reservedAce', 'Please ensure the prop: $ace is not defined in the schema, because $ace is a reserved prop', { prop })
    if (prop === '$aceId') throw AceError('schema__validatePropName__reservedAce', `Please ensure the prop: $aceId is not defined in the schema, because $aceId is a reserved prop`, { prop })
  }
}
