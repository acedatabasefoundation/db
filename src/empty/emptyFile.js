import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { getPaths, initPaths } from '../util/file.js'
import { mkdir, rename, writeFile } from 'node:fs/promises'


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
export async function emptyFile (options) {
  if (Memory.txn.step === 'lastReq' && Memory.txn.emptyTimestamp) {
    const paths = getPaths(options.dir, [ 'dir', 'wal', 'trash', 'graphs', 'schemas', 'schemaDetails', 'trashNow', 'trashNowWal', 'trashNowGraphs', 'trashNowSchemas' ])

    await initPaths(paths, [ 'dir', 'trash', 'graphs', 'schemas', 'wal', 'trashNow' ])

    await Promise.all([
      rename(paths.wal, paths.trashNowWal),
      rename(paths.graphs, paths.trashNowGraphs),
      rename(paths.schemas, paths.trashNowSchemas),
    ])

    await Promise.all([
      mkdir(paths.graphs),
      mkdir(paths.schemas),
      writeFile(paths.wal, ''),
    ])

    Memory.wal.fileSize = 0

    // on empty graph we reset all these schema flags
    // if the schema is updated after the empty then one of these booleans will be true and we won't have to write the new details to file b/c writeSchema.js will do it
    if (!Memory.txn.schemaUpdated && !Memory.txn.schemaPushRequested && !Memory.txn.schemaPushRequestedThenSchemaUpdated && Memory.txn.env && Memory.txn.schemaNowDetails?.[Memory.txn.env]) {
      await writeFile(paths.schemaDetails, JSON.stringify(Memory.txn.schemaNowDetails), 'utf-8')
    }
  }
}
