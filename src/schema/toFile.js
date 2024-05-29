import { td } from '#ace'
import { getPath } from '../ace/file.js'
import { open, writeFile } from 'node:fs/promises'


/**
 * @param { td.AceSchema } schema 
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function toFile (schema, options) {
  const details = {}

  details.filehandle = await open(getPath(options.where, 'schemas') + '/details.json', 'a+')
  details.str = await details.filehandle.readFile('utf-8')
  details.obj = (details.str) ? JSON.parse(details.str) : { lastCreatedVersion: 0, currentVersion: 0 }

  details.obj.lastCreatedVersion++
  details.obj.currentVersion = details.obj.lastCreatedVersion

  await details.filehandle.truncate() // idk why but details.filehandle.writeFile() below does an append rather then an overwite

  await Promise.all([
    details.filehandle.writeFile(JSON.stringify(details.obj), 'utf-8'),
    writeFile(getPath(options.where, 'schemas') + `/${ details.obj.lastCreatedVersion }.json`, JSON.stringify(schema, null, 2), 'utf-8')
  ])

  await details.filehandle.close()
}
