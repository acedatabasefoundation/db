import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { unlink, writeFile } from 'node:fs/promises'
import { doesPathExist, getPaths, initPaths } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function revertWriteSchema (options) {
  if (Memory.txn.schemaOriginalDetails) {
    if (!Memory.txn.env) throw AceError('aceFn__missingEnv', 'Please ensure Memory.txn.env is a truthy when calling revertWriteSchema()', { options })

    const paths = getPaths(options.path, [ 'dir', 'schemas', 'schemaDetails' ])

    await initPaths(paths, [ 'dir', 'schemas' ])
    await writeFile(paths.schemaDetails, JSON.stringify(Memory.txn.schemaOriginalDetails), 'utf-8')

    // if original = version 9
    // recently created = version 10
    // so to revert recently created, delete version 10
    const schemaPath = `${ paths.schemas }/${ (Memory.txn.schemaOriginalDetails[ Memory.txn.env ].lastCreatedVersion + 1) }.json`

    if (await doesPathExist(schemaPath)) await unlink(schemaPath)
  }
}
