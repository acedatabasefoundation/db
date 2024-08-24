import { Memory } from '../objects/Memory.js'
import { rm, rename } from 'node:fs/promises'
import { doesPathExist } from '../util/file.js'
import { AceError } from '../objects/AceError.js'
import { setTxnTrashPaths } from '../ace/txn/setTxnPaths.js'


/** @returns { Promise<void> } */
export async function revertEmptyFile () {
  if (Memory.txn.emptyTimestamp) {
    if (!Memory.txn.paths) throw new AceError('revertEmptyFile__missingPaths', 'Please ensure Memory.txn.paths is a truthy when calling revertEmptyFile()', {})

    setTxnTrashPaths()

    if (Memory.txn.paths.trashNow && Memory.txn.paths.trashNowAol && Memory.txn.paths.trashNowGraphs && Memory.txn.paths.trashNowSchemas) {
      if (await doesPathExist(Memory.txn.paths.trashNow)) { // has a trashNow folder been created
        if (await doesPathExist(Memory.txn.paths.trashNowAol)) await rename(Memory.txn.paths.trashNowAol, Memory.txn.paths.aol) // renaming a file if the file already exists does not throw an error

        if (await doesPathExist(Memory.txn.paths.trashNowGraphs)) { // renaming a folder throws an error if it already exists
          if (await doesPathExist(Memory.txn.paths.graphs)) await rm(Memory.txn.paths.graphs, { recursive: true, force: true })
          await rename(Memory.txn.paths.trashNowGraphs, Memory.txn.paths.graphs)
        }

        if (await doesPathExist(Memory.txn.paths.trashNowSchemas)) {
          if (await doesPathExist(Memory.txn.paths.schemas)) await rm(Memory.txn.paths.schemas, { recursive: true, force: true })
          await rename(Memory.txn.paths.trashNowSchemas, Memory.txn.paths.schemas)
        }

        await rm(Memory.txn.paths.trashNow, { recursive: true })
      }
    }
  }
}
