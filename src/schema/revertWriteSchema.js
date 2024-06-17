import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { unlink, writeFile } from 'node:fs/promises'
import { doesPathExist, getPaths, initPaths } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function revertWriteSchema (options) {
  if (Memory.txn.env) {
    let nowLastId = Memory.txn.schemaNowDetails?.[Memory.txn.env]?.lastId
    const originalLastId = Memory.txn.schemaOriginalDetails?.[Memory.txn.env]?.lastId

    if (typeof nowLastId === 'number' && typeof originalLastId === 'number' && nowLastId > originalLastId) { // if we created some schemas since this txn began
      const paths = getPaths(options.dir, ['dir', 'schemas', 'schemaDetails'])

      await initPaths(paths, ['dir', 'schemas'])
      await writeFile(paths.schemaDetails, JSON.stringify(Memory.txn.schemaOriginalDetails), 'utf-8')

      while (nowLastId > originalLastId) {
        const schemaPath = `${ paths.schemas }/${ nowLastId }.json`
        if (await doesPathExist(schemaPath)) await unlink(schemaPath)
        nowLastId--
      }
    }
  }
}
