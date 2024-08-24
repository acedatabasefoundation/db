import { rm, mkdir } from 'node:fs/promises'
import { Memory } from '../objects/Memory.js'
import { doesPathExist } from '../util/file.js'
import { AceError } from '../objects/AceError.js'


/**
 * @returns { Promise<void> }
 */
export async function emptyTrash () {
  if (!Memory.txn.paths) throw new AceError('emptyTrash__missingPaths', 'Please ensure Memory.txn.paths is a truthy when calling emptyTrash()', {})
  if (await doesPathExist(Memory.txn.paths.trash)) await rm(Memory.txn.paths.trash, { recursive: true, force: true })

  await mkdir(Memory.txn.paths.trash)
}
