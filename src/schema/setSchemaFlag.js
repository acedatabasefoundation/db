import { Memory } from '../objects/Memory.js'


/**
 * @param { 'schemaUpdated' | 'schemaPushRequested' } flag
 * @returns { void }
 */
export function setSchemaFlag (flag) {
  if (!Memory.txn.schemaPushRequestedThenSchemaUpdated) { // if schemaPushRequestedThenSchemaUpdated already happened no need for any other flag tipping, if the schema push was not to the last schema version and a schema update is attempted, writeSchema.js will throw an error
    switch (flag) {
      case 'schemaUpdated':
        if (Memory.txn.schemaPushRequested) Memory.txn.schemaPushRequestedThenSchemaUpdated = true
        else Memory.txn.schemaUpdated = true
        break
      case 'schemaPushRequested':
        Memory.txn.schemaPushRequested = true
        break
    }
  }
}
