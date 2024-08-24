import { td } from '#ace'
import { set$ace } from '../set$ace.js'
import { setJWKs } from '../setJWKs.js'
import { deligate } from '../deligate.js'
import { write } from '../../util/storage.js'
import { setTxnId } from '../txn/setTxnId.js'
import { cancelTxn } from '../txn/cancelTxn.js'
import { setTxnEnv } from '../txn/setTxnEnv.js'
import { Memory } from '../../objects/Memory.js'
import { setTxnStep } from '../txn/setTxnStep.js'
import { lastIdKey } from '../../util/variables.js'
import { setTxnPaths } from '../txn/setTxnPaths.js'
import { setHasUpdates } from '../setHasUpdates.js'
import { setTxnTimer } from '../txn/setTxnTimer.js'
import { AceError } from '../../objects/AceError.js'
import { emptyFile } from '../../empty/emptyFile.js'
import { setSchema } from '../../schema/setSchema.js'
import { appendToAol } from '../../aol/appendToAol.js'
import { writeSchema } from '../../schema/writeSchema.js'
import { initMemoryAol } from '../../aol/initMemoryAol.js'
import { addSortIndicesToGraph } from '../mutate/addSortIndicesToGraph.js'
import { validateMustBeDefined } from '../mutate/validateMustBeDefined.js'


/**
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @param { (res: td.AceFnResponse) => void } reject 
 * @param { td.AceFnOptions } options 
 * @param { (params: td.AceFnDoneReqGatewayParams) => td.AceFnDoneReqGatewayResponse } doneReqGateway 
 * @returns { Promise<void> }
 */
export async function enterReqGateway (resolve, reject, options, doneReqGateway) {
  /** @type { td.AceFnFullResponse } - Nodes with all properties will be in original, nodes with requested properties from `query.x` will be in now. */
  const res = { now: {}, original: {} }

  setTxnId(options, res)
  setTxnEnv(options)
  setTxnPaths(options)

  if (options.txn?.do === 'Cancel') await cancelTxn(res, resolve)
  else if (!options.req) throw new AceError('enterReqGateway__falsyReq', 'Please ensure options.req is not falsy. The only time options.req may be falsy is if options.txn.do is "Cancel".', { options })
  else {
    setTxnTimer(reject, options)
    await initMemoryAol()
    setTxnStep(options)

    /** @type { td.AceFnRequestItem[] } */
    const req = Array.isArray(options.req) ? options.req : [ options.req ]

    setHasUpdates(req)

    /** @type { td.AceFnCryptoJWKs } */
    const jwks = { private: {}, public: {}, crypt: {} }

    if (options.jwks) await setJWKs(jwks, options)
    if (!Memory.txn.schema) await setSchema()

    await deligate(options, req, res, jwks)
    await addSortIndicesToGraph(options)
    set$ace(res, options)

    if (Memory.txn.step === 'lastReq') {
      await validateMustBeDefined()
      await emptyFile() // do this b4 appendToAol() so that new appended stuff does not get emptied

      if (Memory.txn.lastGraphId && (Memory.txn.emptyTimestamp || Memory.txn.startGraphId !== Memory.txn.lastGraphId)) { // getGraphId() increments, here we storage set
        write({ $aA: 'upsert', $aK: lastIdKey, value: Memory.txn.lastGraphId })
      }

      await appendToAol() // do this after above write so lastId gets apended to aol
      await writeSchema(options)

    }

    await doneReqGateway({ res, resolve })
  }
}
