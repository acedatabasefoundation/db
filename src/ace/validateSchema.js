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

  /** @type { Map<string, td.AceSchemaDirectionsMapDirection[]> } - `Map<relationshipName, [{ nodeName, nodePropName, id }]>` - Helps ensure relationships defined in `schema.relationships` have required and properfly formatted nodes props in `schema.nodes` */
  const directionsMap = new Map()

  /** @type { Set<number> } Each id will go in here to ensure we do not have duplicate ids */
  const aceIdSet = new Set()

  for (const nodeName in schema.nodes) {
    if (nodeNameSet.has(nodeName)) throw AceError('schema__notUniqueNodeName', `The node name ${ nodeName } is not unique, please ensure each nodeName is unique`, { nodeName })

    nodeNameSet.add(nodeName)

    if (typeof nodeName !== 'string') throw AceError('schema__invalidNodeType', `The node name ${ nodeName } is an invalid type, please add node that is a type of string`, { nodeName })
    if (nodeName.includes(DELIMITER)) throw AceError('schema__nodeDelimeter', `The node name ${ nodeName } includes ${ DELIMITER } which Ace does not allow b/c ${ DELIMITER } is used as a delimeter within our query language`, { nodeName })
    if (nodeName.includes(' ')) throw AceError('schema__hasSpaces', `The node name ${nodeName} is an invalid because it has a space in it, please add nodes that have no spaces in them`, { nodeName })
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
            if (mapValue.has(nodePropName)) throw AceError('schema__notUniqueNodePropName', `The node name ${ nodeName } and prop name ${ nodePropName } is not unique, please ensure all node prop names are unique for the node`, { nodeName, nodePropName })
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
    if (!nodeNameSet.has(relationshipPropNodeName)) throw AceError('schema__invalidRelationshipPropNodeName', `The node name \`${ relationshipPropNodeName }\` that is defined as a prop nodeName is not defined @ schema.nodes, please add relationship prop node names that are valid (a node in the schema)`, { nodeName: relationshipPropNodeName, schema })
  }

  for (const relationshipName of relationshipNameArray) {
    if (relationshipNameSet.has(relationshipName)) throw AceError('schema__notUniqueRelationshipName', `The relationship name \`${relationshipName}\` is not unique, please ensure each relationshipName is unique`, { relationshipName })
    if (nodeNameSet.has(relationshipName)) throw AceError('schema__notUniqueRelationshipName', `The relationship name \`${ relationshipName }\` is not unique b/c it is already defined as a node name, please ensure each relationshipName is unique`, { relationshipName })

    relationshipNameSet.add(relationshipName)

    const relationship = schema.relationships?.[relationshipName]
    const _errorData = { relationshipName, relationship }

    if (typeof relationshipName !== 'string') throw AceError('schema__invalidRelationshipType', `The relationship name \`${ relationshipName }\` is not a type of string, please add relationships that are a type of string`, _errorData)
    if (relationship?.is !== 'OneToOne' && relationship?.is !== 'ManyToMany' && relationship?.is !== 'OneToMany') throw AceError('schema__invalidRelationshipId', `The relationship name \`${ relationshipName }\` is invalid b/c relationship?.id is invalid, please ensure relationships have a valid relationship id of OneToOne, OneToMany or ManyToMany`, _errorData)
    if (relationshipName.includes(DELIMITER)) throw AceError('schema__relationshipDelimeter', `The relationship name ${relationshipName} includes ${DELIMITER} which Ace does not allow b/c ${DELIMITER} is used as a delimeter within our query language`, { relationshipName })
    if (relationshipName.includes(' ')) throw AceError('schema__hasSpaces', `Please ensure relationship names do not includes a space, this is not happening yet for the relationship name: ${ relationshipName }`, { relationshipName })
    if (typeof relationship.$aceId !== 'number') throw AceError('schema__missingAceId', `Please ensure each schema node has an $aceId that is a type of "number", this is not happening yet for the node: ${relationshipName}`, { relationship })
    if (aceIdSet.has(relationship.$aceId)) throw AceError('schema__duplicateAceId', `Please ensure each schema node has an $aceId that is unique, this is not happening yet for the node: ${ relationshipName }`, { relationship })
    
    aceIdSet.add(relationship.$aceId)

    if (relationship.props) {
      if (typeof relationship.props !== 'object' || Array.isArray(relationship.props)) throw AceError('schema__invalidRelationshipProps', `The relationship name ${ relationshipName } has invalid props, if you'd love to include props please ensure relationship.props type, is an object`, _errorData)

      for (const propName in relationship.props) {
        if (propName !== SCHEMA_ID) {
          validateSchemaProp(propName, relationship.props[propName], true, aceIdSet)

          const mapValue = uniqueRelationshipPropsMap.get(relationshipName)

          if (!mapValue) uniqueRelationshipPropsMap.set(relationshipName, new Set([propName]))
          else {
            if (mapValue.has(propName)) throw AceError('schema__notUniqueRelationshipPropName', `The relationship name \`${ relationshipName }\` and the prop name \`${ propName }\` is defined more then once in the schema, please ensure all relationship prop names are unique for the node`, { relationshipName, propName })
            else mapValue.add(propName)
          }
        }
      }
    }
  }

  if (relationshipNameArray.length !== directionsMap.size) throw AceError('schema__invalidRelationships', 'All relationships listed in schema.nodes must also be listed in schema.relationships', { schemaNodeRelationships: directionsMap.keys(), schemaRelationships: relationshipNameArray })

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
        if (directions[0].nodePropName === directions[1].nodePropName) throw AceError('schema__invalidRelationshipPropName', 'Prop names for a relationship must be different so we may do relationship queries', { relationshipName, directions })
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
  return AceError('schema__invalidRelationshipAlignment', `The relationship name \`${ relationshipName }\` has invalid props, please ensure each relationship has 1 BidirectionalRelationshipProp or 1 ForwardRelationshipProp and 1 ReverseRelationshipProp`, { relationshipName, directions })
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

      if (!schemaProp.options.dataType) throw AceError('schema__falsyDataType', `The schema prop ${ propName } is because its dataType is falsy, Please ensure every data type is valid`, { propName, propValue })
      if (!enums.dataTypes[schemaProp.options.dataType]) throw AceError('schema__invalidDataType', `The schema prop ${ propName } is invalid because its dataType is not a valid option, please add a dataType that is a valid enums.dataTypes. Valid options include ${ enums.dataTypes }`, { propName, propValue })
      break
    case 'ForwardRelationshipProp':
    case 'ReverseRelationshipProp':
    case 'BidirectionalRelationshipProp':
      const schemaRelationshipProp = /** @type { td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp } */ (propValue)

      if (isRelationshipProp) throw AceError('schema__invalidId', `The schema prop ${ propName } is invalid because prop's must have an id of "SchemaProp" and not "SchemaRelationshipProp"`, { propName, propValue })
      if (schemaRelationshipProp.options.has !== 'one' && schemaRelationshipProp.options.has !== 'many') throw AceError('schema__invalidHas', `The schema prop ${ propName } is invalid because has is not "one" or "many", please ensure "has" is "one" or "many"`, { propName, propValue })
      if (typeof schemaRelationshipProp.options.node !== 'string' || !schemaRelationshipProp.options.node) throw AceError('schema__invalidNodeName', `The schema prop ${ propName } is invalid because the nodeName is not a truthy string, please ensure each schema prop that has a truthy string nodeName`, { propName, propValue })
      if (typeof schemaRelationshipProp.options.relationship !== 'string' || !schemaRelationshipProp.options.relationship) throw AceError('schema__invalidRelationshipName', `The schema prop ${ propName } is invalid because the relationshipName is not a truthy string, please ensure each schema prop that has a truthy string relationshipName`, { propName, propValue })
      break
    default:
      if (isRelationshipProp) throw AceError('schema__invalidId', `The schema prop ${ propName } is invalid because prop's must include an id of "SchemaProp"`, { propName, propValue })
      break
  }
}


/**
 * Validate Schema Prop Key
 * @param { string } prop
 * @param { boolean } isRelationshipProp
 */
function validatePropName (prop, isRelationshipProp) {
  if (typeof prop !== 'string') throw AceError('schema__validatePropName__notString', `The prop ${ prop } is invalid because it is not a type of string, please ensure each prop has a type of string`, { prop })
  if (prop.includes(' ')) throw AceError('schema__validatePropName__hasSpaces', `The prop ${ prop } is an invalid because it has a space in it, please add props that have no spaces in them`, { prop })
  if (prop.includes(DELIMITER)) throw AceError('schema__validatePropName__delimeter', `The prop ${prop} includes ${DELIMITER} which Ace does not allow b/c ${DELIMITER} is used as a delimeter within our query language`, { prop })

  if (isRelationshipProp) {
    if (prop === 'id') throw AceError('schema__validatePropName__relationshipId', 'The prop id is invalid because id is a reserved relationship prop', { prop })
    if (prop === 'a') throw AceError('schema__validatePropName__relationshipA', 'The prop a is invalid because a is a reserved relationship prop', { prop })
    if (prop === 'b') throw AceError('schema__validatePropName__relationshipB', 'The prop b is invalid because b is a reserved relationship prop', { prop })
    if (!prop.startsWith('_')) throw AceError('schema__validatePropName__addUnderscore', `The prop ${ prop } is invalid because relationship props must start with an underscore. This helps know what props in a query are relationship props`, { prop })
  } else {
    if (prop === 'id') throw AceError('schema__validatePropName__nodeId', 'The prop id is invalid because id is a reserved node prop', { prop })
    if (prop.startsWith('_')) throw AceError('schema__validatePropName__removeUnderscore', `The prop ${ prop } is invalid because none relationship props may not start with an underscore. This helps know what props in a query are relationship props`, { prop })
    if (prop === '$ace') throw AceError('schema__validatePropName__reservedAce', 'The prop $ace is reserved, please ensure no prop is named $ace', { prop })
    if (prop === '$aceId') throw AceError('schema__validatePropName__reservedAce', `Please ensure node props are not named $aceId. This is not happening yet for the prop: ${ prop }`, { prop })
  }
}
