import { td } from '#ace'
import { SchemaDataStructures } from './SchemaDataStructures.js'


/** @returns { td.AceTxn } */
export function Txn () {
  return {
    schema: null,
    step: 'preEnter',
    writeArray: [],
    lastGraphId: null,
    startGraphId: null,
    enumGraphIds: new Map(),
    sortIndexMap: new Map(),
    schemaDataStructures: SchemaDataStructures(null),
  }
}
