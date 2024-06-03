import { td } from '#ace'
import { createReadStream } from 'node:fs'
import { Memory } from '../objects/Memory.js'
import { createInterface } from 'node:readline'
import { doesPathExist, getByteAmount, getPaths } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function walMapInitialize (options) {
  const paths  = getPaths(options.path, [ 'wal' ])

  if (await doesPathExist(paths.wal)) {
    return new Promise(async (resolve, reject) => {
      try {
        const readLineInterface = createInterface({ input: createReadStream(paths.wal), crlfDelay: Infinity })

        readLineInterface.on('error', reject)
        readLineInterface.on('close', resolve)

        readLineInterface.on('line', (strLine) => {
          try {
            const line = JSON.parse(strLine)
            const item = { value: line[2], do: line[1] }

            Memory.wal.map.set(line[0], item)
            Memory.wal.byteAmount += (getByteAmount(line[0]) + getByteAmount(item))
          } catch (e) {
            reject(e)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}
