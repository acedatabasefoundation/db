import { rm, mkdir } from 'node:fs/promises'
import { AceError } from '../objects/AceError.js'
import { doesPathExist, getPaths } from '../util/file.js'


/**
 * @param { string } dir
 * @returns { Promise<void> }
 */
export async function emptyTrash (dir) {
  if (!dir) throw AceError('emptyTrash__dirRequired', 'Please ensure each call to ace trash empty includes the directory that holds the trash folder like this: ace trash empty ./ace', {})

  const paths = getPaths(dir, [ 'trash' ])

  if (!await doesPathExist(paths.trash)) mkdir(paths.trash)
  else {
    await rm(paths.trash, { recursive: true, force: true })
    await mkdir(paths.trash)
  }

  console.log('✨ trash is empty!')
}
