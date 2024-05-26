import { td } from '#ace'
import { SchemaDataStructures } from './SchemaDataStructures.js'


/** @returns { td.AceTxn } */
export function Txn () {
  return {
    writeStr: '',
    schema: null,
    hasUpdates: false,
    step: 'notStarted',
    writeMap: new Map(),
    sortIndexMap: new Map(),
    wasEmptyRequested: false,
    enumGraphIdsMap: new Map(),
    schemaDataStructures: SchemaDataStructures(null),
  }
}
