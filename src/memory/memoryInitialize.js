import fs from 'node:fs'
import { td } from '#ace'
import { memory } from './memory.js'
import { createInterface } from 'node:readline'
import { getByteAmount, relativeToAbsolutePath } from '../ace/file.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function memoryInitialize (options) {
  return new Promise((resolve, reject) => {
    try {
      const readLineInterface = createInterface({ input: fs.createReadStream(relativeToAbsolutePath(options.where) + '/wal.txt'), crlfDelay: Infinity })

      readLineInterface.on('error', reject)
      readLineInterface.on('close', resolve)

      readLineInterface.on('line', (strLine) => {
        const line = JSON.parse(strLine)
        const item = { value: line[2], action: line[1] }

        memory.wal.map.set(line[0], item)
        memory.wal.byteAmount += (getByteAmount(line[0]) + getByteAmount(item))
      })
    } catch (e) {
      reject(e)
    }
  })
}
