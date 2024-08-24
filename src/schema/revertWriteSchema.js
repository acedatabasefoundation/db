import { Memory } from '../objects/Memory.js'
import { unlink, writeFile } from 'node:fs/promises'
import { doesPathExist, initPaths } from '../util/file.js'


/** @returns { Promise<void> } */
export async function revertWriteSchema () {
  if (Memory.txn.env && Memory.txn.paths) {
    let nowLastId = Memory.txn.schemaNowDetails?.[Memory.txn.env]?.lastId
    const originalLastId = Memory.txn.schemaOriginalDetails?.[Memory.txn.env]?.lastId

    if (typeof nowLastId === 'number' && typeof originalLastId === 'number' && nowLastId > originalLastId) { // if we created some schemas since this txn began

      await initPaths(['dir', 'schemas'])
      await writeFile(Memory.txn.paths.schemaDetails, JSON.stringify(Memory.txn.schemaOriginalDetails), 'utf-8')

      while (nowLastId > originalLastId) {
        const schemaPath = `${ Memory.txn.paths.schemas }/${ nowLastId }.json`
        if (await doesPathExist(schemaPath)) await unlink(schemaPath)
        nowLastId--
      }
    }
  }
}
