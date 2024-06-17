import { td } from '#ace'
import { ace } from '../ace/ace.js'
import { AceError } from '../objects/AceError.js'


/**
 * @param { td.AceSecureParams } params 
 * @returns { Promise<td.AceFnResponse> }
 */
export async function secureAce ({ options, token }) {
  if (!token.req) throw AceError('secureAce__falsyReq', 'Please ensure the token.req is truthy', {})
  if (!token.correct) throw AceError('secureAce__falsyCorrect', 'Please ensure the token.correct is truthy', {})
  if (token.req !== token.correct) throw AceError('secureAce__incorrectToken', 'Please ensure the token is correct', {})

  return await ace(options)
}
