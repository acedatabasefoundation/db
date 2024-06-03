import { td } from '#ace'
import nodePath from 'node:path'
import { Memory } from '../objects/Memory.js'
import { mkdir, stat, writeFile } from 'node:fs/promises'


/**
 * @param { string } path
 * @param { td.AceFileGetPathsTypes } types
 * @returns { td.AceFilePaths }
 */
export function getPaths (path, types) {
  const res = {}
  const start = (path.endsWith('/')) ? path.slice(0, -1) : path
  const dir = relativeToAbsolutePath(start)

  for (const type of types) {
    switch (type) {
      case 'dir':
        res.dir = dir
        break
      case 'wal':
        res.wal = dir + '/wal.txt'
        break
      case 'trash':
        res.trash = dir + '/trash'
        break
      case 'graphs':
        res.graphs = dir + '/graphs'
        break
      case 'schemas':
        res.schemas = dir + '/schemas'
        break
      case 'schemaDetails':
        res.schemaDetails = dir + '/schemas/details.json'
        break
      case 'trashNow':
        res.trashNow = dir + '/trash/' + Memory.txn.emptyTimestamp
        break
      case 'trashNowWal':
        res.trashNowWal = dir + '/trash/' + Memory.txn.emptyTimestamp + '/wal.txt'
        break
      case 'trashNowGraphs':
        res.trashNowGraphs = dir + '/trash/' + Memory.txn.emptyTimestamp + '/graphs'
        break
      case 'trashNowSchemas':
        res.trashNowSchemas = dir + '/trash/' + Memory.txn.emptyTimestamp + '/schemas'
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
 * @param { string } item - The path, but not called path b/c we import path into this file
 * @returns { Promise<boolean> }
 */
export async function doesPathExist (item) {
  try {
    await stat(item)
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
