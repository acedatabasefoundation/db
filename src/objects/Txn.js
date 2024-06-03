import { td } from '#ace'
import { SchemaDataStructures } from './SchemaDataStructures.js'


/** @returns { td.AceTxn } */
export function Txn () {
  return {
    writeStr: '',
    schema: null,
    step: 'preEnter',
    hasUpdates: false,
    writeMap: new Map(),
    schemaUpdated: false,
    sortIndexMap: new Map(),
    enumGraphIdsMap: new Map(),
    schemaDataStructures: SchemaDataStructures(null),
  }
}
