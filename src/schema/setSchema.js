import { td } from '#ace'
import { readFile } from 'node:fs/promises'
import { initPaths } from '../util/file.js'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { SchemaDetail } from '../objects/SchemaDetail.js'
import { SchemaDataStructures } from '../objects/SchemaDataStructures.js'


/** @returns { Promise<void> } */
export async function setSchema () {
  if (!Memory.txn.env) throw new AceError('setSchema__missingEnv', 'Please ensure Memory.txn.env is a truthy when calling setSchema()', {})
  if (!Memory.txn.paths) throw new AceError('setSchema__missingPaths', 'Please ensure Memory.txn.paths is a truthy when calling setSchema()', {})

  await initPaths([ 'dir', 'schemas' ])

  if (!Memory.txn.schemaOriginalDetails || !Memory.txn.schemaNowDetails) { // if no details => bind details from file
    const str = await readFile(Memory.txn.paths.schemaDetails, { encoding: 'utf-8', flag: 'a+' })

    if (str) {
      Memory.txn.schemaNowDetails = JSON.parse(str)
      Memory.txn.schemaOriginalDetails = JSON.parse(str)
    }
  }

  if (!Memory.txn.schemaOriginalDetails || !Memory.txn.schemaNowDetails) { // if still no details => init details
    Memory.txn.schemaNowDetails = { [ Memory.txn.env ]: SchemaDetail() }
    Memory.txn.schemaOriginalDetails = { [ Memory.txn.env ]: SchemaDetail() }
  } else if (!Memory.txn.schemaOriginalDetails[ Memory.txn.env ]) { // if no details for this env => init details for this env
    Memory.txn.schemaNowDetails[ Memory.txn.env ] = SchemaDetail()
    Memory.txn.schemaOriginalDetails[ Memory.txn.env ] = SchemaDetail()
  } else if (Memory.txn.schemaOriginalDetails[ Memory.txn.env ].nowId) { // if details (is not 0) => bind schema
    const str = await readFile(`${ Memory.txn.paths.schemas }/${ Memory.txn.schemaOriginalDetails[ Memory.txn.env ].nowId }.json`, 'utf8')

    if (str) {
      Memory.txn.schema = /** @type { td.AceSchema } */ (JSON.parse(str))
      Memory.txn.schemaDataStructures = SchemaDataStructures(Memory.txn.schema)
    }
  }
}
