import { Memory } from '../objects/Memory.js'
import { setSchemaFlag } from './setSchemaFlag.js'
import { validateSchema } from './validateSchema.js'
import { SchemaDataStructures } from '../objects/SchemaDataStructures.js'


/**
 * @param { boolean } [ isSourceSchemaPush ]
 * @returns { void }`
 */
export function doneSchemaUpdate (isSourceSchemaPush) {
  if (Memory.txn.schema) {
    validateSchema(Memory.txn.schema)

    Memory.txn.schema = Memory.txn.schema
    Memory.txn.schemaDataStructures = SchemaDataStructures(Memory.txn.schema)

    if (!isSourceSchemaPush) setSchemaFlag('schemaUpdated')
  }
}
