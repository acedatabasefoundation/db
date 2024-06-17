import { td } from '#ace'
import { rm, mkdir } from 'node:fs/promises'
import { doesPathExist, getPaths } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
export async function emptyTrash (options) {
  const paths = getPaths(options.dir, [ 'trash' ])

  if (await doesPathExist(paths.trash)) await rm(paths.trash, { recursive: true, force: true })

  await mkdir(paths.trash)
}
