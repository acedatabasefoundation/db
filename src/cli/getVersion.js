import fs from 'node:fs'


/**
 * @param { string } file
 * @returns { Promise<string> }
 */
export async function getVersion (file) {
  const str = await fs.promises.readFile(file, 'utf-8')
  const json = JSON.parse(str)
  return json.version
}
