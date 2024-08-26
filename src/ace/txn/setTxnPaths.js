import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { relativeToAbsolutePath } from '../../util/file.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { void }
 */
export function setTxnPaths (options) {
  const start = (options.dir.endsWith('/')) ? options.dir.slice(0, -1) : options.dir
  const dirAbsolute = relativeToAbsolutePath(start)

  Memory.txn.paths = {
    dir: dirAbsolute,
    aol: dirAbsolute + '/aol.txt',
    trash: dirAbsolute + '/trash',
    schemas: dirAbsolute + '/schemas',
    schemaDetails: dirAbsolute + '/schemas/details.json',
  }
}


/** @returns { void } */
export function setTxnTrashPaths () {
  if (Memory.txn.paths && Memory.txn.emptyTimestamp) {
    Memory.txn.paths.trashNow = Memory.txn.paths.dir + '/trash/' + Memory.txn.emptyTimestamp
    Memory.txn.paths.trashNowAol = Memory.txn.paths.dir + '/trash/' + Memory.txn.emptyTimestamp + '/aol.txt'
    Memory.txn.paths.trashNowSchemas = Memory.txn.paths.dir + '/trash/' + Memory.txn.emptyTimestamp + '/schemas'
  }
}
