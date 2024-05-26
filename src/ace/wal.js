import fs from 'node:fs'
import { td } from '#ace'
import { memory } from '../memory/memory.js'
import { openFile, relativeToAbsolutePath } from './file.js'


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<fs.promises.FileHandle> }
 */
export async function bindHandle (options) {
  if (!memory.wal.filehandle) {
    memory.wal.filehandle = await openFile(relativeToAbsolutePath(options.where) + '/wal.txt')
  }

  return memory.wal.filehandle
}
