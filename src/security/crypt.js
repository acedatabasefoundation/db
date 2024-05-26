import { cryptAlgorithm } from '../util/variables.js'
import { getRandomBase64 } from './getRandomBase64.js'
import { base64ToUint8, stringToUint8, arrayBufferToBase64, arrayBufferToString } from './transmute.js'


/**
 * @param { string } original 
 * @param { string } jwk 
 */
export async function encrypt (original, jwk) {
  const ivBase64 = getRandomBase64()

  const cryptoKey = await crypto.subtle.importKey('jwk', JSON.parse(jwk), cryptAlgorithm, true, ['encrypt', 'decrypt'])
  const encryptArrayBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: base64ToUint8(ivBase64) }, cryptoKey, stringToUint8(original))

  return {
    iv: ivBase64,
    encrypted: arrayBufferToBase64(encryptArrayBuffer)
  }
}


/**
 * @param { string } encrypted 
 * @param { string } iv 
 * @param { string } jwk 
 */
export async function decrypt (encrypted, iv, jwk) {
  const cryptoKey = await crypto.subtle.importKey('jwk', JSON.parse(jwk), cryptAlgorithm, true, ['encrypt', 'decrypt'])

  const decryptUint8 = base64ToUint8(encrypted)
  const decryptArrayBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToUint8(iv) }, cryptoKey, decryptUint8)

  return arrayBufferToString(decryptArrayBuffer)
}
