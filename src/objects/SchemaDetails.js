import { td } from '../index.js'
import { Memory } from './Memory.js'
import { AceError } from './AceError.js'


/** @returns { td.AceSchemaDetails } */
export function SchemaDetails () {
  if (!Memory.txn.env) throw AceError('aceFn__missingEnv', 'Please ensure Memory.txn.env is a truthy when calling SchemaDetails()', {})

  return {
    [ Memory.txn.env ]: { lastCreatedVersion: 0, currentVersion: 0 }
  }
}
