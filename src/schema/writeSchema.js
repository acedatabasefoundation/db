import { td } from '#ace'
import { writeFile } from 'node:fs/promises'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { getPaths, initPaths } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function writeSchema (options) {
  if (Memory.txn.step === 'lastReq' && Memory.txn.schemaUpdated && Memory.txn.schema)  {
    if (!Memory.txn.schemaNowDetails) throw AceError('writeSchema__falsySchemaNowDetails', 'Please ensure memory.txn.schemaNowDetails is truthy', {})

    const paths = getPaths(options.path, [ 'dir', 'schemas', 'schemaDetails' ])

    await initPaths(paths, [ 'dir', 'schemas' ])

    Memory.txn.schemaNowDetails.lastCreatedVersion++
    Memory.txn.schemaNowDetails.currentVersion = Memory.txn.schemaNowDetails.lastCreatedVersion

    await Promise.all([
      writeFile(paths.schemaDetails,  JSON.stringify(Memory.txn.schemaNowDetails), 'utf-8'),
      writeFile(paths.schemas + `/${ Memory.txn.schemaNowDetails.lastCreatedVersion }.json`, JSON.stringify(Memory.txn.schema, null, 2), 'utf-8')
    ])
  }
}
