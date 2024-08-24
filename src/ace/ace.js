import { td } from '#ace'
import { doneReqGateway } from './gateway/doneReqGateway.js'
import { approachReqGateway } from './gateway/approachReqGateway.js'


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<td.AceFnResponse> }
 */
export async function ace (options) {
  return new Promise(async (resolve, reject) => {
    try {
      console.time('✨ ace')
      await approachReqGateway(resolve, reject, options)
    } catch (error) {
      console.log('error', error)
      try {
        await doneReqGateway({ reject, error })
      } catch (e) {
        console.log('error:', e)
      }
    }
  })
  .finally(() => {
    try {
      console.timeEnd('✨ ace')
    } catch (e) {
      console.log('error:', e)
    }
  })
}
