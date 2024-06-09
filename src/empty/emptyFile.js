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
    const paths = getPaths(options.dir, [ 'dir', 'wal', 'trash', 'graphs', 'schemas', 'trashNow', 'trashNowWal', 'trashNowGraphs', 'trashNowSchemas' ])

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
  }
}
