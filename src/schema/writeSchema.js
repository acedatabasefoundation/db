import { td } from '#ace'
import { writeFile } from 'node:fs/promises'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doesPathExist, getPaths, initPaths } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function writeSchema (options) {
  if (Memory.txn.step === 'lastReq' && Memory.txn.env && Memory.txn.schemaNowDetails) {
    if (Memory.txn.schemaPushRequestedThenSchemaUpdated) await writeDetailsAndSchema(options, Memory.txn.env, Memory.txn.schemaNowDetails)
    else if (Memory.txn.schemaPushRequested) await writeDetails(options)
    else if (Memory.txn.schemaUpdated) await writeDetailsAndSchema(options, Memory.txn.env, Memory.txn.schemaNowDetails)
  }
}


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<td.AceFilePaths> }
 */
async function initSchemaPaths (options) {
  const paths = getPaths(options.dir, [ 'dir', 'schemas', 'schemaDetails' ])
  await initPaths(paths, [ 'dir', 'schemas' ])
  return paths
}


/**
 * @param { td.AceFnOptions } options 
 * @param { string } env 
 * @param { td.AceSchemaDetails } nowDetails 
 * @returns { Promise<void> }
 */
async function writeDetailsAndSchema (options, env, nowDetails) {
  const paths = await initSchemaPaths(options)

  nowDetails[env].lastId++ // increment lastId b/c we are writing a new schema
  nowDetails[env].nowId = nowDetails[env].lastId // set nowId to lastId

  const schemaPath = paths.schemas + `/${ nowDetails[env].lastId }.json`

  if (await doesPathExist(schemaPath)) throw AceError('writeSchema__overwritingSchema', `Please ensure schema version updates do not overwrite each other. This path already exists: [ options.dir]/schemas/${ nowDetails[env].lastId }.json. Please first push to the latest schema version using ace schema:push and then update the schema.`, { schemaVersionId: nowDetails[env].lastId })

  await Promise.all([
    writeFile(schemaPath, JSON.stringify(Memory.txn.schema, null, 2), 'utf-8'),
    writeFile(paths.schemaDetails, JSON.stringify(Memory.txn.schemaNowDetails), 'utf-8'),
  ])
}


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
async function writeDetails (options) {
  const paths = await initSchemaPaths(options)
  await writeFile(paths.schemaDetails, JSON.stringify(Memory.txn.schemaNowDetails), 'utf-8')
}
