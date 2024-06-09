import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { rm, rename } from 'node:fs/promises'
import { getPaths, doesPathExist } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
export async function revertEmptyFile (options) {
  if (Memory.txn.emptyTimestamp) {
    const paths = getPaths(options.dir, [ 'wal', 'graphs', 'schemas', 'trashNow', 'trashNowWal', 'trashNowGraphs', 'trashNowSchemas' ])

    if (await doesPathExist(paths.trashNow)) { // has a trashNow folder been created
      if (await doesPathExist(paths.trashNowWal)) await rename(paths.trashNowWal, paths.wal) // renaming a file if the file already exists does not throw an error

      if (await doesPathExist(paths.trashNowGraphs)) { // renaming a folder throws an error if it already exists
        if (await doesPathExist(paths.graphs)) await rm(paths.graphs, { recursive: true, force: true })
        await rename(paths.trashNowGraphs, paths.graphs)
      }

      if (await doesPathExist(paths.trashNowSchemas)) {
        if (await doesPathExist(paths.schemas)) await rm(paths.schemas, { recursive: true, force: true })
        await rename(paths.trashNowSchemas, paths.schemas)
      }

      await rm(paths.trashNow, { recursive: true })
    }
  }
}
