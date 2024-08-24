import { base64ToUint8, stringToUint8, arrayBufferToBase64, arrayBufferToString } from './transmute.js'


/**
 * @param { string } original 
 * @param { CryptoKey } cryptoKey 
 * @param { string } ivBase64 
 * @returns { Promise<string> }
 */
export async function encrypt (original, cryptoKey, ivBase64) {
  const encryptArrayBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: base64ToUint8(ivBase64) }, cryptoKey, stringToUint8(original))

  return arrayBufferToBase64(encryptArrayBuffer)
}


/**
 * @param { string } encrypted 
 * @param { string } ivBase64 
 * @param { CryptoKey } cryptoKey 
 * @returns { Promise<string> }
 */
export async function decrypt (encrypted, ivBase64, cryptoKey) {
  const decryptUint8 = base64ToUint8(encrypted)
  const decryptArrayBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToUint8(ivBase64) }, cryptoKey, decryptUint8)

  return arrayBufferToString(decryptArrayBuffer)
}
