import { td } from '#ace'
import { cryptAlgorithm, importGenerateAlgorithm } from '../util/variables.js'


/**
 * @param { td.AceFnCryptoJWKs } cryptoJWKs 
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function setJWKs (cryptoJWKs, options) {
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
