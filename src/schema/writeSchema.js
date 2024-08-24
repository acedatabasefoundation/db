import { td } from '#ace'
import { writeFile } from 'node:fs/promises'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { doesPathExist, initPaths } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function writeSchema (options) {
  if (Memory.txn.step === 'lastReq' && Memory.txn.env && Memory.txn.schemaNowDetails) {
    if (!Memory.txn.paths) throw new AceError('writeDetailsAndSchema__missingPaths', 'Please ensure Memory.txn.paths is a truthy when calling writeDetailsAndSchema()', {})

    if (Memory.txn.schemaPushRequestedThenSchemaUpdated) await writeDetailsAndSchema(Memory.txn.paths, Memory.txn.env, Memory.txn.schemaNowDetails)
    else if (Memory.txn.schemaPushRequested) await writeDetails(Memory.txn.paths)
    else if (Memory.txn.schemaUpdated) await writeDetailsAndSchema(Memory.txn.paths, Memory.txn.env, Memory.txn.schemaNowDetails)
  }
}


/**
 * @param { td.AceFilePaths } paths 
 * @param { string } env 
 * @param { td.AceSchemaDetails } nowDetails 
 * @returns { Promise<void> }
 */
async function writeDetailsAndSchema (paths, env, nowDetails) {
  await initPaths(['dir', 'schemas'])

  nowDetails[env].lastId++ // increment lastId b/c we are writing a new schema
  nowDetails[env].nowId = nowDetails[env].lastId // set nowId to lastId

  const schemaPath = paths.schemas + `/${ nowDetails[env].lastId }.json`

  if (await doesPathExist(schemaPath)) throw new AceError('writeSchema__overwritingSchema', `Please ensure schema version updates do not overwrite each other. This path already exists: [ options.dir]/schemas/${ nowDetails[env].lastId }.json. Please first push to the latest schema version using ace schema:push and then update the schema.`, { schemaVersionId: nowDetails[env].lastId })

  await Promise.all([
    writeFile(schemaPath, JSON.stringify(Memory.txn.schema, null, 2), 'utf-8'),
    writeFile(paths.schemaDetails, JSON.stringify(Memory.txn.schemaNowDetails), 'utf-8'),
  ])
}


/**
 * @param { td.AceFilePaths } paths 
 * @returns { Promise<void> }
 */
async function writeDetails (paths) {
  await initPaths([ 'dir', 'schemas' ])
  await writeFile(paths.schemaDetails, JSON.stringify(Memory.txn.schemaNowDetails), 'utf-8')
}
