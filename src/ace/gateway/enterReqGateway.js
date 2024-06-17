import { td } from '#ace'
import { set$ace } from '../set$ace.js'
import { setJWKs } from '../setJWKs.js'
import { deligate } from '../deligate.js'
import { setTxnId } from '../txn/setTxnId.js'
import { cancelTxn } from '../txn/cancelTxn.js'
import { setTxnEnv } from '../txn/setTxnEnv.js'
import { Memory } from '../../objects/Memory.js'
import { setTxnStep } from '../txn/setTxnStep.js'
import { appendWal } from '../../wal/appendWal.js'
import { setHasUpdates } from '../setHasUpdates.js'
import { setTxnTimer } from '../txn/setTxnTimer.js'
import { AceError } from '../../objects/AceError.js'
import { doneReqGateway } from './doneReqGateway.js'
import { emptyFile } from '../../empty/emptyFile.js'
import { setSchema } from '../../schema/setSchema.js'
import { writeSchema } from '../../schema/writeSchema.js'
import { walMapInitialize } from '../../wal/walMapInitialize.js'
import { addSortIndicesToGraph } from '../mutate/addSortIndicesToGraph.js'
import { validateMustBeDefined } from '../mutate/validateMustBeDefined.js'


/**
 * @param { (res: td.AceFnResponse) => void } resolve 
 * @param { (res: td.AceFnResponse) => void } reject 
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function enterReqGateway (resolve, reject, options) {
  /** @type { td.AceFnFullResponse } - Nodes with all properties will be in original, nodes with requested properties from `query.x` will be in now. */
  const res = { now: {}, original: {} }

  setTxnId(options, res)
  setTxnEnv(options)

  if (options.txn?.do === 'Cancel') await cancelTxn(res, resolve, options)
  else if (!options.req) throw AceError('missingWhat', 'Please ensure options.req is not falsy. The only time options.req may be falsy is if options.txn.do is "Cancel".', { options })
  else {
    setTxnTimer(reject, options)

    if (Memory.txn.step === 'preEnter' && !Memory.wal.byteAmount) { // IF txn's first time through gateway AND no wal memory saved yet from any previous txn's => initialize memory
      await walMapInitialize(options) 
    }

    setTxnStep(options)

    /** @type { td.AceFnRequestItem[] } */
    const req = Array.isArray(options.req) ? options.req : [ options.req ]

    setHasUpdates(req)

    /** @type { td.AceFnCryptoJWKs } */
    const jwks = { private: {}, public: {}, crypt: {} }

    if (options.jwks) await setJWKs(jwks, options)
    if (!Memory.txn.schema) await setSchema(options)

    await deligate(options, req, res, jwks)
    await addSortIndicesToGraph()
    set$ace(res, options)

    if (Memory.txn.step === 'lastReq') {
      await validateMustBeDefined()
      await emptyFile(options) // do this b4 appendWal() so that new appended stuff does not get emptied
      await appendWal(options)
      await writeSchema(options)
    }

    await doneReqGateway({ res, resolve, options })
  }
}
