import { td } from '#ace'
import nodePath from 'node:path'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { stat, open, mkdir, writeFile } from 'node:fs/promises'


/**
 * @param { td.AceFileInitPathsTypes } types
 * @returns { Promise<void> }
 */
export async function initPaths (types) {
  if (!Memory.txn.paths) throw new AceError('initPaths__missingPaths', 'Please ensure Memory.txn.paths is a truthy when calling setSchema()', {})

  for (let i = 0; i < types.length; i++) {
    switch (types[i]) {
      case 'dir':
        if (!await doesPathExist(Memory.txn.paths.dir)) await mkdir(Memory.txn.paths.dir)
        break
      case 'trash':
        if (!await doesPathExist(Memory.txn.paths.trash)) await mkdir(Memory.txn.paths.trash)
        break
      case 'schemas':
        if (!await doesPathExist(Memory.txn.paths.schemas)) await mkdir(Memory.txn.paths.schemas)
        break
      case 'aol':
        if (!Memory.aol.filehandle || !await doesPathExist(Memory.txn.paths.aol)) Memory.aol.filehandle = await open(Memory.txn.paths.aol, 'a+') // this also sets Memory so the condition has more
        break
      case 'trashNow':
        if (Memory.txn.paths.trashNow && !await doesPathExist(Memory.txn.paths.trashNow)) await mkdir(Memory.txn.paths.trashNow)
        break
    }
  }
}


/**
 * @param { string } path
 * @returns { Promise<boolean> }
 */
export async function doesPathExist (path) {
  try {
    await stat(path)
    return true
  } catch (e) {
    return false
  }
}


/**
 * @param { * } item 
 * @returns { number }
 */
export function getByteAmount (item) {
  return ((new TextEncoder()).encode(item)).length
}



/**
 * '.' is the process.cwd()
 * process.cwd() is the current working directory (cwd)
 * A users is the directory that holds their package.json
 * @param { string } relativePath 
 * @returns { string }
 */
export function relativeToAbsolutePath (relativePath) {
  return nodePath.resolve('.', relativePath)
}
