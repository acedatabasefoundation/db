import path from 'node:path'


/**
 * @param { * } item 
 * @returns { number }
 */
export function getByteAmount (item) {
  return ((new TextEncoder()).encode(item)).length
}


/**
 * @param { string } where 
 * @param { 'wal' | 'schemas' | 'graphs' } type 
 * @returns { string }
 */
export function getPath (where, type) {
  const start = (where.endsWith('/')) ? where.slice(0, -1) : where

  switch (type) {
    case 'wal':
      return relativeToAbsolutePath(start + '/wal.txt')
    case 'schemas':
      return relativeToAbsolutePath(start + '/schemas')
    case 'graphs':
      return relativeToAbsolutePath(start + '/graphs')
  }
}


/**
 * '.' is the process.cwd()
 * process.cwd() is the current working directory (cwd)
 * A users is the directory that holds their package.json
 * @param { string } relativePath 
 * @returns { string }
 */
function relativeToAbsolutePath (relativePath) {
  return path.resolve('.', relativePath)
}