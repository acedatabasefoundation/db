import { td } from '#ace'
import { bindHandle } from './wal.js'
import { Txn } from '../objects/Txn.js'
import { getByteAmount } from './file.js'
import { memory } from '../memory/memory.js'
import { AceError } from '../objects/AceError.js'
import { aceDoUpdateSet } from '../enums/aceDo.js'
import { getMany, getOne, write } from './storage.js'
import { memoryInitialize } from '../memory/memoryInitialize.js'
import { queryNode, queryRelationship } from './query/query.js'
import { inupNode, inupRelationship } from './mutate/mutate.js'
import { validateMustBeDefined } from './validateMustBeDefined.js'
import { SchemaDataStructures } from '../objects/SchemaDataStructures.js'
import { SCHEMA_KEY, cryptAlgorithm, importGenerateAlgorithm } from '../util/variables.js'
import { deleteRelationshipsBy_Ids, relationshipPropDeleteData } from './mutate/mutateRelationship.js'
import { deleteNodesByIds, nodeDeleteDataAndDeleteFromSchema, nodePropDeleteData, nodePropDeleteDataAndDeleteFromSchema } from './mutate/mutateNode.js'
import { addToSchema, schemaUpdateNodeName, schemaUpdateNodePropName, schemaUpdateRelationshipName, schemaUpdateRelationshipPropName } from './mutate/mutateSchema.js'


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<td.AceFnResponse> }
 */
export async function ace (options) {
  return new Promise(async (resolve, reject) => {
    try {
      console.time('✨ ace')
      await approachReqGateway(resolve, reject, options)
    } catch (e) {
      try {
        await doneReqGateway({ e }, { reject })
      } catch (error) {
        console.log('error:', error)
      }
    }
  })
  .finally(() => {
    try {
      console.timeEnd('✨ ace')
      log(options)
    } catch (e) {
      console.log('error:', e)
    }
  })
}


/**
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @param { td.AcePromiseReject } reject 
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
async function approachReqGateway (resolve, reject, options) {
  if (memory.txn.step === 'notStarted' || options.txn?.id === memory.txn.id) await enterReqGateway(resolve, options)
  else memory.queue.push({ resolve, reject, options })
}


/**
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
async function enterReqGateway (resolve, options) {
  /** @type { td.AceFnFullResponse } - Nodes with all properties will be in original, nodes with requested properties from `query.x` will be in now. */
  const res = { now: {}, original: {} }

  setTxnId(options, res)

  if (options.txn?.action === 'cancel') await cancelTxn(res, resolve)
  else if (!options.what) throw AceError('aceFn__missingWhat', 'Please ensure options.what is not falsy. The only time options.what may be falsy is if options.txn.action is "cancel".', { options })
  else {
    /** @type { td.AceFnRequestItem[] } */
    const req =  Array.isArray(options.what) ? options.what : [ options.what ]

    setTxnStep(options)
    setHasUpdates(req)

    /** @type { td.AceFnCryptoJWKs } */
    const jwks = { private: {}, public: {}, crypt: {} }

    if (options.jwks) await setJWKs(jwks, options)
    if (!memory.txn.writeMap.size && !memory.wal.map.size) await memoryInitialize(options)

    await setSchema()
    await deligate(req, res, jwks, options)
    await addSortIndicesToGraph()
    set$ace(res, options)

    if (memory.txn.step === 'reqLastOne') {
      await validateMustBeDefined()
      await txnToWal(options)
    }

    await doneReqGateway({ res }, { resolve })
  }
}


/**
 * @param { td.AceFnOptions } options 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function setTxnId (options, res) {
  if (options.txn?.action === 'start') {
    memory.txn.id = crypto.randomUUID()

    if (!res.now.$ace) res.now.$ace = { txnId: memory.txn.id }
    else res.now.$ace.txnId = memory.txn.id
  } else if (options.txn?.id) {
    memory.txn.id = options.txn.id

    if (!res.now.$ace) res.now.$ace = { txnId: memory.txn.id }
    else res.now.$ace.txnId = memory.txn.id
  }
}


/**
 * @param { td.AceFnFullResponse } res 
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @returns { Promise<void> }
 */
async function cancelTxn (res, resolve) {
  if (!res.now.$ace) res.now.$ace = { txnCancelled: true }
  else res.now.$ace.txnCancelled = true

  await doneReqGateway({ res }, { resolve })
}


/**
 * @param { td.AceFnOptions } options 
 * @returns { void }
 */
function setTxnStep (options) {
  switch (memory.txn.step) {
    case 'notStarted':
      if (options.txn?.action === 'start') memory.txn.step = 'reqNotLastOne'
      else if (options.txn?.action === 'complete') memory.txn.step = 'reqLastOne'
      else if (options.txn?.id) memory.txn.step = 'reqNotLastOne'
      else memory.txn.step = 'reqLastOne'
      break
    case 'waiting':
    case 'reqNotLastOne':
      if (options.txn?.action === 'complete') memory.txn.step = 'reqLastOne'
      else memory.txn.step = 'reqNotLastOne'
      break
  }
}


/**
 * @param { td.AceFnRequestItem[] } req
 * @returns { Promise<void> }
 */
async function setHasUpdates (req) {
  if (!memory.txn.hasUpdates) memory.txn.hasUpdates = Boolean(req.find(reqItem => aceDoUpdateSet.has(reqItem.do)))
}


/**
 * @param { td.AceFnCryptoJWKs } cryptoJWKs 
 * @param { td.AceFnOptions } options 
 */
async function setJWKs (cryptoJWKs, options) {
  if (options.jwks) {
    for (const name in options.jwks) {
      switch (options.jwks[name].type) {
        case 'public':
          cryptoJWKs.public[name] = await crypto.subtle.importKey('jwk', JSON.parse(options.jwks[name].jwk), importGenerateAlgorithm, true, ['verify'])
          break
        case 'private':
          cryptoJWKs.private[name] = await crypto.subtle.importKey('jwk', JSON.parse(options.jwks[name].jwk), importGenerateAlgorithm, true, ['sign'])
          break
        case 'crypt':
          cryptoJWKs.crypt[name] = await crypto.subtle.importKey('jwk', JSON.parse(options.jwks[name].jwk), cryptAlgorithm, true, ['encrypt', 'decrypt'])
          break
      }
    }
  }
}


/**
 * @returns { Promise<void> }
 */
async function setSchema () {
  if (!memory.txn.schema) {
    memory.txn.schema = await getOne(SCHEMA_KEY)
    memory.txn.schemaDataStructures = SchemaDataStructures(memory.txn.schema)
  }
}


/**
 * @param { td.AceFnRequestItem[] } req 
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceFnOptions } options 
 */
async function deligate (req, res, jwks, options) {
  for (let iReq = 0; iReq < req.length; iReq++) {
    switch (req[iReq].do) {
      case 'Empty':
        await empty(options)
        break


      case 'MemoryInitialize':
        await memoryInitialize(options)
        break


      case 'NodeQuery':
        await queryNode(res, jwks, iReq, /** @type { td.AceQueryRequestItemNode } */(req[iReq]))
        break


      case 'RelationshipQuery':
        await queryRelationship(res, jwks, iReq, /** @type { td.AceQueryRequestItemRelationship } */(req[iReq]))
        break


      case 'SchemaGet':
        res.now[/** @type { td.AceQueryRequestItemSchemaGet } */(req[iReq]).how] = memory.txn.schema
        break


      case 'SchemaAdd':
        addToSchema(/** @type { td.AceMutateRequestItemSchemaAdd } */(req[iReq]))
        break


      case 'NodeInsert':
      case 'NodeUpdate':
      case 'NodeUpsert':
        await inupNode(jwks, /** @type { td.AceMutateRequestItemNodeInsert | td.AceMutateRequestItemNodeUpdate } */(req[iReq]))
        break


      case 'RelationshipInsert':
      case 'RelationshipUpdate':
      case 'RelationshipUpsert':
        await inupRelationship(/** @type { td.AceMutateRequestItemRelationshipInsert | td.AceMutateRequestItemRelationshipUpdate } */(req[iReq]))
        break


      case 'NodeDeleteData':
        await deleteNodesByIds(/** @type { { how: (string|number)[] } } */(req[iReq]).how)
        break


      case 'RelationshipDeleteData':
        await deleteRelationshipsBy_Ids(/** @type { td.AceMutateRequestItemRelationshipDeleteData } */(req[iReq]).how._ids)
        break


      case 'NodePropDeleteData':
        await nodePropDeleteData(/** @type { td.AceMutateRequestItemNodePropDeleteData } */(req[iReq]))
        break


      case 'RelationshipPropDeleteData':
        await relationshipPropDeleteData(/** @type { td.AceMutateRequestItemRelationshipPropDeleteData } */(req[iReq]))
        break


      case 'NodeDeleteDataAndDeleteFromSchema':
        await nodeDeleteDataAndDeleteFromSchema(/** @type { td.AceMutateRequestItemNodeDeleteDataAndDeleteFromSchema } */(req[iReq]))
        break


      case 'NodePropDeleteDataAndDeleteFromSchema':
        await nodePropDeleteDataAndDeleteFromSchema(/** @type { td.AceMutateRequestItemNodePropDeleteDataAndDeleteFromSchema } */(req[iReq]))
        break


      case 'SchemaUpdateNodeName':
        await schemaUpdateNodeName(/** @type { td.AceMutateRequestItemSchemaUpdateNodeName } */(req[iReq]))
        break


      case 'SchemaUpdateNodePropName':
        await schemaUpdateNodePropName(/** @type { td.AceMutateRequestItemSchemaUpdateNodePropName } */(req[iReq]))
        break


      case 'SchemaUpdateRelationshipName':
        await schemaUpdateRelationshipName(/** @type { td.AceMutateRequestItemSchemaUpdateRelationshipName } */(req[iReq]))
        break


      case 'SchemaUpdateRelationshipPropName':
        await schemaUpdateRelationshipPropName(/** @type { td.AceMutateRequestItemSchemaUpdateRelationshipPropName } */(req[iReq]))
        break
    }
  }
}


/** @returns { Promise<void> } */
async function addSortIndicesToGraph () {
  if (memory.txn.sortIndexMap.size) {
    for (const entry of memory.txn.sortIndexMap) {
      /** @type { (string | number)[] } */
      const graphIdsArray = await getOne(entry[0]) || []
      const allIdsSet = new Set(graphIdsArray.concat(entry[1].newIds))

      /** @type { Map<string | number, td.AceGraphNode> } */
      const allNodesMap = await getMany([ ...allIdsSet ])

      const allNodesArray = []

      for (const id of allIdsSet) { // ensure the graphNode was not deleted
        const graphNode = allNodesMap.get(id)
        if (graphNode) allNodesArray.push(graphNode)
      }

      const allNodesSorted = allNodesArray.sort((a, b) => Number(a.props[entry[1].propName] > b.props[entry[1].propName]) - Number(a.props[entry[1].propName] < b.props[entry[1].propName])) // order ascending

      write('upsert', entry[0], allNodesSorted.map(n => n.id))
    }
  }
}


/**
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnOptions } options 
 * @returns { void } 
 */
function set$ace (res, options) {
  if (memory.txn.enumGraphIdsMap.size) {
    if (!res.now.$ace) res.now.$ace = { enumIds: {} }
    if (!res.now.$ace.enumIds) res.now.$ace.enumIds = {}

    for (const entry of memory.txn.enumGraphIdsMap) {
      res.now.$ace.enumIds[entry[0]] = entry[1]
    }
  }

  if (memory.txn.writeMap.size) {
    for (const entry of memory.txn.writeMap) {
      if (entry[1].action === 'delete') {
        if (!res.now.$ace) res.now.$ace = { deletedKeys: [ entry[0] ] }
        else if (!res.now.$ace.deletedKeys) res.now.$ace.deletedKeys = [ entry[0] ]
        else res.now.$ace.deletedKeys.push(entry[0])
      }
    }
  }

  switch (options.txn?.action) {
    case 'start':
      if (!res.now.$ace) res.now.$ace = { txnStarted: true }
      else res.now.$ace.txnStarted = true
      break
    case 'complete':
      if (!res.now.$ace) res.now.$ace = { txnCompleted: true }
      else res.now.$ace.txnCompleted = true
      break
    case 'cancel':
      if (!res.now.$ace) res.now.$ace = { txnCancelled: true }
      else res.now.$ace.txnCancelled = true
      break
  }
}


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
async function txnToWal (options) {
  if (memory.txn.step === 'reqLastOne' && memory.txn.writeStr) {
    memory.wal.filehandle = await bindHandle(options)

    await memory.wal.filehandle.appendFile(memory.txn.writeStr, { flag: 'a+', flush: true })

    for (const entry of memory.txn.writeMap) {
      memory.wal.map.set(entry[0], entry[1])
      memory.wal.byteAmount += (getByteAmount(entry[0]) + getByteAmount(entry[1]))
    }
  }
}


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
async function empty (options) {
  memory.txn.wasEmptyRequested = true

  memory.txn.schema = null
  memory.txn.writeStr = ''
  memory.txn.schemaDataStructures = SchemaDataStructures(null)

  memory.txn.writeMap.clear()
  memory.txn.enumGraphIdsMap.clear()

  memory.wal.byteAmount = 0
  memory.wal.map.clear()
  memory.wal.miniIndex = []

  memory.wal.filehandle = await bindHandle(options)
  await memory.wal.filehandle.truncate()
}


/**
 * @param { { res?: td.AceFnFullResponse, e?: any } } item
 * @param { { resolve?: (res: td.AceFnResponse) => void, reject?: td.AcePromiseReject } } fn
 * @returns { Promise<void> }
 */
async function doneReqGateway (item, fn) {
  if (item.res && fn.resolve) fn.resolve(item.res.now)
  else if (fn.reject) {
    console.log('error:', item.e)
    fn.reject(item.e) 
  }

  if (fn.reject || memory.txn.step === 'reqLastOne' || item.res?.now?.$ace?.txnCancelled) { // IF last request in txn
    memory.txn = Txn()

    if (memory.queue.length) {
      const next = memory.queue.shift()
      if (next) await approachReqGateway(next.resolve, next.reject, next.options)
    } else if (memory.wal.filehandle) {
      await memory.wal.filehandle.close()
      memory.wal.filehandle = undefined // in other functions, to know if the filehandle is closed, we falsy check
    }
  } else {
    memory.txn.step = 'waiting'
  }
}


/**
 * @param { td.AceFnOptions } options
 */
function log (options) {
  try {
    /** @type { { where: string, what?: { do: string } | ({ do: string } | string)[] | undefined } } */
    const formatted = {
      where: options.where,
    }

    if (Array.isArray(options.what)) {
      formatted.what = []

      for (let i = 0; i < 3; i++) {
        if (options.what[i]) formatted.what.push({ do: options.what[i].do })
      }

      if (options.what[3]) formatted.what.push('...')
    } else if (options.what) {
      formatted.what = { do: options.what.do }
    }

    console.log(formatted, '\n')
  } catch (e) {
    console.log('error', e)
  }
}
