import { td } from '#ace'
import { memory } from '../../memory/memory.js'
import { AceError } from '../../objects/AceError.js'
import { validateSchema } from '../validateSchema.js'
import { write, getMany, getOne } from '../storage.js'
import { SchemaDataStructures } from '../../objects/SchemaDataStructures.js'
import { DELIMITER, SCHEMA_KEY, getNodeIdsKey, getRelationshipProp, getRelationshipIdsKey } from '../../util/variables.js'


/**
 * @param { td.AceMutateRequestItemSchemaAdd } reqItem 
 * @returns { void }
 */
export function addToSchema (reqItem) {
  /** @type { * } Deep copy current schema, only assign memory.txn.schema to _schema if _schema passes vaidation */
  let _schema = memory.txn.schema ? structuredClone(memory.txn.schema) : {}

  // add nodes to schema
  if (reqItem.how.nodes) {
    for (const node in reqItem.how.nodes) {
      if (!_schema) _schema = { nodes: { [node]: reqItem.how.nodes[node] }, relationships: {} }
      else if (!_schema.nodes) _schema.nodes = { [node]: reqItem.how.nodes[node] }
      else if (_schema.nodes[node]) _schema.nodes[node] = { ..._schema.nodes[node], ...reqItem.how.nodes[node] }
      else _schema.nodes[node] = reqItem.how.nodes[node]
    }
  }

  // add relationships to schema
  if (reqItem.how.relationships) {
    for (const relationship in reqItem.how.relationships) {
      if (!_schema) _schema = { nodes: {}, relationships: { [relationship]: reqItem.how.relationships[relationship] } }
      else if (!_schema.relationships) _schema.relationships = { [relationship]: reqItem.how.relationships[relationship] }
      else if (_schema.relationships[relationship]) _schema.relationships[relationship] = { ..._schema.relationships[relationship], ...reqItem.how.relationships[relationship] }
      else _schema.relationships[relationship] = reqItem.how.relationships[relationship]
    }
  }

  write('upsert', SCHEMA_KEY, validateSchema(_schema))
  memory.txn.schema = _schema
  memory.txn.schemaDataStructures = SchemaDataStructures(_schema)
}


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateNodeName } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateNodeName ( reqItem) {
  for (const { nowName, newName } of reqItem.how.nodes) {
    if (!memory.txn.schema?.nodes[nowName]) throw AceError('schemaUpdateNodeName__invalidNowName', 'The node cannot be renamed b/c it is not defined in your schema', { nowName, newName })

    // update node on each graphNode
    const nodeIdsKey = getNodeIdsKey(nowName)

    /** @type { string[] } */
    const nodeIds = await getOne(nodeIdsKey)

    if (nodeIds.length) {
      /** @type { Map<string | number, td.AceGraphNode> } */
      const graphNodes = await getMany(nodeIds)

      for (const entry of graphNodes) {
        entry[1].node = newName
        write('update', entry[0], entry[1])
      }
    }


    // update nodeIdsKey
    const newNodeIdsKey = getNodeIdsKey(newName)
    write('update', newNodeIdsKey, nodeIds)
    write('delete', nodeIdsKey)


    // update schema
    const nodeRelationshipPropsSet = memory.txn.schemaDataStructures.nodeRelationshipPropsMap?.get(nowName)

    if (nodeRelationshipPropsSet) {
      for (const pointer of nodeRelationshipPropsSet) {
        const split = pointer.split(DELIMITER)

        if (split.length !== 2) throw AceError('schemaUpdateNodeName__invalidSplit', 'Split should have a length of 2, the first index should be a node name and the second should be a relationship prop name', { split })

        /** @type { * } */
        let options = memory.txn.schema.nodes[split[0]][split[1]].options

        if (options.node !== nowName) throw AceError('schemaUpdateNodeName__invalidNode', 'The options.node should equal the nowName', { optionsDotNode: options.node, nowName })

        /** @type { td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp } */
        options = options

        options.node = newName
        memory.txn.schema.nodes[newName] = memory.txn.schema.nodes[nowName]
        delete memory.txn.schema.nodes[nowName]
      }
    }

    schemaDeleteConclude()
  }
}


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateNodePropName } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateNodePropName (reqItem) {
  for (const { node, nowName, newName } of reqItem.how.props) {
    if (!memory.txn.schema?.nodes[node]) throw AceError('schemaUpdateNodePropName__invalidNode', `The prop cannot be renamed b/c the node ${node} it is not defined in your schema`, { node, nowName, newName })
    if (!memory.txn.schema?.nodes[node]?.[nowName]) throw AceError('schemaUpdateNodePropName__invalidProp', `The prop cannot be renamed b/c the node ${node} and the prop ${nowName} is not defined in your schema`, { node, nowName, newName })

    /** @type { string[] } */
    const nodeIds = await getOne(getNodeIdsKey(node))

    if (nodeIds.length) {
      /** @type { Map<string | number, td.AceGraphNode> } */
      const graphNodes = await getMany(nodeIds)

      for (const entry of graphNodes) {
        if (typeof entry[1].props[nowName] !== 'undefined') {
          entry[1].props[newName] = entry[1].props[nowName]
          delete entry[1].props[nowName]
          write('update', entry[0], entry[1])
        }
      }
    }

    // update schema
    memory.txn.schema.nodes[node][newName] = memory.txn.schema.nodes[node][nowName]
    delete memory.txn.schema.nodes[node][nowName]
    schemaDeleteConclude()
  }
}



/** 
 * @param { td.AceMutateRequestItemNodeDeleteDataAndDeleteFromSchemaNode } reqNodeName
 * @returns { void }
 */
export function schemaDeleteNodes (reqNodeName) {
  if (memory.txn.schema) {
    /** @type { Set<string> } - As we flow through nodes, the relationships that need to be deleted will be added here */
    const deleteRelationshipSet = new Set()

    /** @type { Map<string, { schemaNodeName: string, propName: string }> } - <schemaNodeName___propName, { schemaNodeName, propName }> */
    const deletePropsMap = new Map()

    for (const schemaNodeName in memory.txn.schema.nodes) {
      for (const propName in memory.txn.schema.nodes[schemaNodeName]) {
        const schemaPropOptions = /** @type { td.AceSchemaNodeRelationshipOptions } */ (memory.txn.schema.nodes[schemaNodeName][propName].options)

        if (schemaPropOptions?.node === reqNodeName) {
          deleteRelationshipSet.add(schemaPropOptions.relationship)
          deletePropsMap.set(schemaNodeName + DELIMITER + propName, { schemaNodeName, propName })
        }
      }
    }

    for (const relationshipName of deleteRelationshipSet) {
      delete memory.txn.schema.relationships?.[relationshipName]
    }

    for (const entry of deletePropsMap) {
      delete memory.txn.schema.nodes[entry[1].schemaNodeName][entry[1].propName]
    }
  }
}


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateRelationshipName } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateRelationshipName (reqItem) {
  for (const { nowName, newName } of reqItem.how.relationships) {
    if (!memory.txn.schema?.relationships?.[nowName]) throw AceError('schemaUpdateRelationshipName__invalidNowName', 'The relationship cannot be renamed b/c it is not defined in your schema', { nowName, newName })

    // update relationship on each graphRelationship
    const relationshipIdsKey = getRelationshipIdsKey(nowName)

    /** @type { (string | number)[] } */
    const relationshipIds = await getOne(relationshipIdsKey)

    if (relationshipIds.length) {
      const graphNodeIds = [] // put a and b node ids here

      /** @type { Map<string | number, td.AceGraphRelationship> } */
      const graphRelationships = await getMany(relationshipIds)

      // update graphRelationship.relationship
      for (const entry of graphRelationships) {
        entry[1].relationship = newName
        write('update', entry[0], entry[1])
        graphNodeIds.push(entry[1].props.a)
        graphNodeIds.push(entry[1].props.b)
      }

      /** @type { Map<string | number, td.AceGraphNode> } */
      const graphNodes = await getMany(graphNodeIds)
      const nowRelationshipProp = getRelationshipProp(nowName)
      const newRelationshipProp = getRelationshipProp(newName)

      // update graphNode.$r__[ nowName ]
      for (const entry of graphNodes) {
        if (entry[1][nowRelationshipProp]) {
          entry[1][newRelationshipProp] = entry[1][nowRelationshipProp]
          delete entry[1][nowRelationshipProp]
          write('update', entry[0], entry[1])
        }
      }
    }

    // update relationshipIdsKey
    const newRelationshipIdsKey = getRelationshipIdsKey(newName)
    write('update', newRelationshipIdsKey, relationshipIds)
    write('delete', relationshipIdsKey)

    // update schema relationship
    memory.txn.schema.relationships[newName] = memory.txn.schema.relationships[nowName]
    delete memory.txn.schema.relationships[nowName]

    // update schema node props
    const relationshipNodeProps = memory.txn.schemaDataStructures.relationshipPropsMap?.get(nowName)

    if (relationshipNodeProps) {
      for (const entry of relationshipNodeProps) {
        entry[1].propValue.options.relationship = newName
        memory.txn.schema.nodes[entry[1].propNode][entry[0]] = entry[1].propValue
      }
    }

    schemaDeleteConclude()
  }
}


/** 
 * @param { td.AceMutateRequestItemSchemaUpdateRelationshipPropName } reqItem
 * @returns { Promise<void> }
 */
export async function schemaUpdateRelationshipPropName (reqItem) {
  for (const { relationship, nowName, newName } of reqItem.how.props) {
    if (!memory.txn.schema?.relationships?.[relationship]) throw AceError('schemaUpdateRelationshipPropName__invalidRelationship', `The prop cannot be renamed b/c the relationship ${ relationship } it is not defined in your schema`, { relationship, nowName, newName })
    if (!memory.txn.schema?.relationships[relationship]?.props?.[nowName]) throw AceError('schemaUpdateRelationshipPropName__invalidProp', `The prop cannot be renamed b/c the relationship ${ relationship } and the prop ${ nowName } is not defined in your schema`, { relationship, nowName, newName })

    /** @type { (string | number)[] } Update prop on each graphRelationship */
    const relationshipIds = await getOne(getRelationshipIdsKey(relationship))

    if (relationshipIds.length) {
      /** @type { Map<string | number, td.AceGraphRelationship> } */
      const graphRelationships = await getMany(relationshipIds)

      for (const entry of graphRelationships) {
        if (typeof entry[1].props[nowName] !== 'undefined') {
          entry[1].props[newName] = entry[1].props[nowName]
          delete entry[1].props[nowName]
          write('update', entry[0], entry[1])
        }
      }
    }

    // update schema
    const props = memory.txn.schema.relationships[relationship].props

    if (props) {
      props[newName] = props[nowName]
      delete props[nowName]
      schemaDeleteConclude()
    }
  }
}


/** @returns { void } */
export function schemaDeleteConclude () {
  if (memory.txn.schema) {
    validateSchema(memory.txn.schema)
    write('upsert', SCHEMA_KEY, memory.txn.schema)
    memory.txn.schemaDataStructures = SchemaDataStructures(memory.txn.schema)
  }
}
