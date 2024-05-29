import { td } from '#ace'
import { getPath } from '../ace/file.js'
import { readFile } from 'node:fs/promises'


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<{ schema: null | td.AceSchema, currentVersion: null | number, lastCreatedVersion: null | number }> }
 */
export async function fromFile (options) {
  /** @type { { schema: null | td.AceSchema, currentVersion: null | number, lastCreatedVersion: null | number } } */
  const res = { schema: null, currentVersion: null, lastCreatedVersion: null }

  const details = {}
  details.str = await readFile(getPath(options.where, 'schemas') + '/details.json', { encoding: 'utf-8', flag: 'a+' })

  if (details.str) {
    details.obj = JSON.parse(details.str)
    res.currentVersion = details.obj.currentVersion
    res.lastCreatedVersion = details.obj.lastCreatedVersion

    const str = await readFile(getPath(options.where, 'schemas') + `/${ details.obj.currentVersion }.json`, 'utf8')

    if (str) res.schema = /** @type { td.AceSchema } */ (JSON.parse(str))
  }

  return res
}
