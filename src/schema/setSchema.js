import { td } from '#ace'
import { readFile } from 'node:fs/promises'
import { Memory } from '../objects/Memory.js'
import { getPaths, initPaths } from '../util/file.js'
import { SchemaDataStructures } from '../objects/SchemaDataStructures.js'


/**
 * Set `memory.txn.schema`, `memory.txn.schemaDataStructures`, `memory.txn.schemaNowDetails` and `memory.txn.schemaOriginalDetails`
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function setSchema (options) {
  let schema = /** @type { null | td.AceSchema } */ (null)
  const paths = getPaths(options.path, [ 'dir', 'schemas', 'schemaDetails' ])

  await initPaths(paths, [ 'dir', 'schemas' ])

  if (!Memory.txn.schemaOriginalDetails || !Memory.txn.schemaNowDetails) {
    const str = await readFile(paths.schemaDetails, { encoding: 'utf-8', flag: 'a+' })

    if (str) {
      Memory.txn.schemaNowDetails = JSON.parse(str)
      Memory.txn.schemaOriginalDetails = JSON.parse(str)
    }
  }

  if (Memory.txn.schemaOriginalDetails) {
    const str = await readFile(`${ paths.schemas }/${ Memory.txn.schemaOriginalDetails.currentVersion }.json`, 'utf8')
    if (str) schema = /** @type { td.AceSchema } */ (JSON.parse(str))
  } else {
    Memory.txn.schemaNowDetails = { lastCreatedVersion: 0, currentVersion: 0 }
    Memory.txn.schemaOriginalDetails = { lastCreatedVersion: 0, currentVersion: 0 }
  }

  Memory.txn.schema = schema
  Memory.txn.schemaDataStructures = SchemaDataStructures(Memory.txn.schema)
}
