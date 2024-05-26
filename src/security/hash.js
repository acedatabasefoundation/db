import { signVerifyAlgorithm } from '../util/variables.js'
import { stringToUint8, arrayBufferToBase64, base64ToUint8 } from './transmute.js'


/**
 * @param { string } original
 * @param { CryptoKey } privateKey
 * @returns { Promise<string> }
 */
export async function sign (original, privateKey) {
  const hashArrayBuffer = await crypto.subtle.sign(signVerifyAlgorithm, privateKey, stringToUint8(original))
  return arrayBufferToBase64(hashArrayBuffer)
}


/**
 * @param { string } original
 * @param { string } hashBase64
 * @param { CryptoKey } publicKey
 * @returns { Promise<boolean> }
 */
export async function verify (original, hashBase64, publicKey) {
  return await crypto.subtle.verify(signVerifyAlgorithm, publicKey, base64ToUint8(hashBase64), stringToUint8(original))
}
