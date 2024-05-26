/**
 * @param { Uint8Array } uint8Array
 * @returns { string }
 */
export function uint8ToBase64 (uint8Array) {
  return btoa(String.fromCharCode(...uint8Array))
}


/**
 * @param { string } base64
 * @returns { Uint8Array }
 */
export function base64ToUint8 (base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}


/**
 * @param { ArrayBuffer } arrayBuffer 
 * @returns { string }
 */
export function arrayBufferToBase64 (arrayBuffer) {
  return uint8ToBase64(new Uint8Array(arrayBuffer))
}


/**
 * @param { ArrayBuffer } arrayBuffer 
 * @returns { string }
 */
export function arrayBufferToString (arrayBuffer) {
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(arrayBuffer)
}


/**
 * @param { string } str 
 * @returns { Uint8Array }
 */
export function stringToUint8 (str) {
  return (new TextEncoder()).encode(str)
}
