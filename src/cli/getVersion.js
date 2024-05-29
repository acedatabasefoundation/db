import { readFile } from 'node:fs/promises'


/**
 * @param { string } file
 * @returns { Promise<string> }
 */
export async function getVersion (file) {
  const str = await readFile(file, 'utf-8')
  const json = JSON.parse(str)
  return json.version
}
