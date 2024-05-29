import { td } from '#ace'
import { getPath } from './file.js'
import { open } from 'node:fs/promises'
import { memory } from '../memory/memory.js'


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<import('node:fs/promises').FileHandle> }
 */
export async function bindHandle (options) {
  if (!memory.wal.filehandle) {
    memory.wal.filehandle = await open(getPath(options.where, 'wal'), 'a+')
  }

  return memory.wal.filehandle
}
