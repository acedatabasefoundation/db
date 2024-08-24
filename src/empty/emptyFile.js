import { initPaths } from '../util/file.js'
import { Memory } from '../objects/Memory.js'
import { setTxnTrashPaths } from '../ace/txn/setTxnPaths.js'
import { open, mkdir, rename, writeFile } from 'node:fs/promises'


/** @returns { Promise<void> } */
export async function emptyFile () {
  if (Memory.txn.step === 'lastReq' && Memory.txn.emptyTimestamp) {
    setTxnTrashPaths()
    await initPaths([ 'dir', 'trash', 'graphs', 'schemas', 'trashNow' ])

    if (Memory.txn.paths && Memory.txn.paths.trashNowAol && Memory.txn.paths.trashNowGraphs && Memory.txn.paths.trashNowSchemas) {
      await Promise.all([
        rename(Memory.txn.paths.aol, Memory.txn.paths.trashNowAol),
        rename(Memory.txn.paths.graphs, Memory.txn.paths.trashNowGraphs),
        rename(Memory.txn.paths.schemas, Memory.txn.paths.trashNowSchemas),
      ])

      await Promise.all([
        mkdir(Memory.txn.paths.graphs),
        mkdir(Memory.txn.paths.schemas),
      ])

      Memory.aol.nowFileSize = 0
      Memory.aol.filehandle = await open(Memory.txn.paths.aol, 'a+') // Open file for reading and appending. The file is created if it does not exist.

      // on empty graph we reset all these schema flags
      // if the schema is updated after the empty then one of these booleans will be true and we won't have to write the new details to file b/c writeSchema.js will do it
      if (!Memory.txn.schemaUpdated && !Memory.txn.schemaPushRequested && !Memory.txn.schemaPushRequestedThenSchemaUpdated && Memory.txn.env && Memory.txn.schemaNowDetails?.[Memory.txn.env]) {
        await writeFile(Memory.txn.paths.schemaDetails, JSON.stringify(Memory.txn.schemaNowDetails), 'utf-8')
      }
    }
  }
}
