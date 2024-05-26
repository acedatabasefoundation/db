import fs from 'node:fs'
import path from 'node:path'


/**
 * @param { string } absolutePath
 * @returns { Promise<fs.promises.FileHandle> }
 */
export async function openFile (absolutePath) {
  return fs.promises.open(absolutePath, 'a+')
}



/**
 * '.' is the process.cwd()
 * process.cwd() is the current working directory (cwd)
 * A users is the directory that holds their package.json
 * @param { string } relativePath 
 * @returns { string }
 */
export function relativeToAbsolutePath (relativePath) {
  return path.resolve('.', relativePath)
}


/**
 * @param { * } item 
 * @returns { number }
 */
export function getByteAmount (item) {
  return ((new TextEncoder()).encode(item)).length
}
