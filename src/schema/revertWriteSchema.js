import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { unlink, writeFile } from 'node:fs/promises'
import { doesPathExist, getPaths, initPaths } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function revertWriteSchema (options) {
  if (Memory.txn.schemaOriginalDetails) {
    const paths = getPaths(options.path, [ 'dir', 'schemas', 'schemaDetails' ])

    await initPaths(paths, [ 'dir', 'schemas' ])
    await writeFile(paths.schemaDetails, JSON.stringify(Memory.txn.schemaOriginalDetails), 'utf-8')
    const schemaPath = `${ paths.schemas }/${ (Memory.txn.schemaOriginalDetails.lastCreatedVersion + 1) }.json`

    if (await doesPathExist(schemaPath)) await unlink(schemaPath)
  }
}
