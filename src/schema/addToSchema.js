import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { doneUpdate } from './doneUpdate.js'


/**
 * @param { td.AceMutateRequestItemSchemaAdd } reqItem 
 * @returns { void }
 */
export function addToSchema (reqItem) {
  /** @type { * } */
  let _schema = Memory.txn.schema ? structuredClone(Memory.txn.schema) : {}

  /** @type { number } Id's on nodes, relationships & props help us know what has been changed when we compare 2 schema's */
  let lastId = _schema.lastId || 0

  if (reqItem.how.nodes) { // add nodes to schema
    for (const node in reqItem.how.nodes) {
      if (!_schema) _schema = { nodes: { [node]: reqItem.how.nodes[node] }, relationships: {} }
      else if (!_schema.nodes) _schema.nodes = { [node]: reqItem.how.nodes[node] }
      else if (_schema.nodes[node]) _schema.nodes[node] = { ..._schema.nodes[node], ...reqItem.how.nodes[node] }
      else _schema.nodes[node] = reqItem.how.nodes[node]

      if (!_schema.nodes[node].$aceId) {
        lastId++
        _schema.nodes[node].$aceId = lastId
      }

      for (const propName in _schema.nodes[node]) {
        if (propName !== '$aceId' && !_schema.nodes[node][propName].$aceId) {
          lastId++
          _schema.nodes[node][propName].$aceId = lastId
        }
      }
    }
  }

  if (reqItem.how.relationships) { // add relationships to schema
    for (const relationship in reqItem.how.relationships) {
      if (!_schema) _schema = { nodes: {}, relationships: { [relationship]: reqItem.how.relationships[relationship] } }
      else if (!_schema.relationships) _schema.relationships = { [relationship]: reqItem.how.relationships[relationship] }
      else if (_schema.relationships[relationship]) _schema.relationships[relationship] = { ..._schema.relationships[relationship], ...reqItem.how.relationships[relationship] }
      else _schema.relationships[relationship] = reqItem.how.relationships[relationship]

      if (!_schema.relationships[relationship].$aceId) {
        lastId++
        _schema.relationships[relationship].$aceId = lastId
      }

      if (_schema.relationships[relationship].props) {
        for (const propName in _schema.relationships[relationship].props) {
          if (propName !== '$aceId' && !_schema.relationships[relationship].props[propName].$aceId) {
            lastId++
            _schema.relationships[relationship].props[propName].$aceId = lastId
          }
        }
      }
    }
  }

  _schema.lastId = lastId
  Memory.txn.schema = _schema
  doneUpdate()
}
