import { td } from '#ace'
import nodePath from 'node:path'
import { Memory } from '../objects/Memory.js'
import { mkdir, stat, writeFile } from 'node:fs/promises'


/**
 * @param { string } dir
 * @param { td.AceFileGetPathsTypes } types
 * @returns { td.AceFilePaths }
 */
export function getPaths (dir, types) {
  const res = {}
  const start = (dir.endsWith('/')) ? dir.slice(0, -1) : dir
  const dirAbsolute = relativeToAbsolutePath(start)

  for (const type of types) {
    switch (type) {
      case 'dir':
        res.dir = dirAbsolute
        break
      case 'wal':
        res.wal = dirAbsolute + '/wal.txt'
        break
      case 'trash':
        res.trash = dirAbsolute + '/trash'
        break
      case 'graphs':
        res.graphs = dirAbsolute + '/graphs'
        break
      case 'schemas':
        res.schemas = dirAbsolute + '/schemas'
        break
      case 'schemaDetails':
        res.schemaDetails = dirAbsolute + '/schemas/details.json'
        break
      case 'trashNow':
        res.trashNow = dirAbsolute + '/trash/' + Memory.txn.emptyTimestamp
        break
      case 'trashNowWal':
        res.trashNowWal = dirAbsolute + '/trash/' + Memory.txn.emptyTimestamp + '/wal.txt'
        break
      case 'trashNowGraphs':
        res.trashNowGraphs = dirAbsolute + '/trash/' + Memory.txn.emptyTimestamp + '/graphs'
        break
      case 'trashNowSchemas':
        res.trashNowSchemas = dirAbsolute + '/trash/' + Memory.txn.emptyTimestamp + '/schemas'
        break
    }
  }

  return res
}


/**
 * @param { td.AceFilePaths } paths
 * @param { td.AceFileInitPathsTypes } types
 * @returns { Promise<void> }
 */
export async function initPaths (paths, types) {
  for (const type of types) {
    switch (type) {
      case 'dir':
        if (!await doesPathExist(paths.dir)) await mkdir(paths.dir)
        break
      case 'trash':
        if (!await doesPathExist(paths.trash)) await mkdir(paths.trash)
        break
      case 'graphs':
        if (!await doesPathExist(paths.graphs)) await mkdir(paths.graphs)
        break
      case 'schemas':
        if (!await doesPathExist(paths.schemas)) await mkdir(paths.schemas)
        break
      case 'wal':
        if (!await doesPathExist(paths.wal)) await writeFile(paths.wal, '')
        break
      case 'trashNow':
        if (!await doesPathExist(paths.trashNow)) await mkdir(paths.trashNow)
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
function relativeToAbsolutePath (relativePath) {
  return nodePath.resolve('.', relativePath)
}
