import { Memory } from '../objects/Memory.js'
import { validateSchema } from './validateSchema.js'
import { SchemaDataStructures } from '../objects/SchemaDataStructures.js'


/** @returns { void } */
export function doneUpdate () {
  if (Memory.txn.schema) {
    validateSchema(Memory.txn.schema)
    Memory.txn.schema = Memory.txn.schema
    Memory.txn.schemaUpdated = true
    Memory.txn.schemaDataStructures = SchemaDataStructures(Memory.txn.schema)
  }
}
