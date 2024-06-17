import { td } from '#ace'
import { SchemaDataStructures } from './SchemaDataStructures.js'


/** @returns { td.AceTxn } */
export function Txn () {
  return {
    writeStr: '',
    schema: null,
    step: 'preEnter',
    writeMap: new Map(),
    sortIndexMap: new Map(),
    enumGraphIdsMap: new Map(),
    schemaDataStructures: SchemaDataStructures(null),
    revertWalDetails: { byteAmount: 0, map: new Map() },
  }
}
