import { td } from '#ace'
import { SchemaDataStructures } from './SchemaDataStructures.js'


/** @returns { td.AceTxn } */
export function Txn () {
  return {
    writeStr: '',
    schema: null,
    step: 'gestate',
    hasUpdates: false,
    writeMap: new Map(),
    schemaUpdated: false,
    sortIndexMap: new Map(),
    wasEmptyRequested: false,
    enumGraphIdsMap: new Map(),
    schemaDataStructures: SchemaDataStructures(null),
  }
}
