import { cryptAlgorithm, importGenerateAlgorithm } from '../util/variables.js'


/**
 * Creates JWKs.
 * A jwk (JSON Web Key) is like a password and helps Ace do cryptography.
 * Use the `privateJWK` to create a hash, use the `publicJWK` to verify a hash and use the `cryptJWK` to encrypt and decrypt data.
 * Ace recommends storing JWKs in your .env file as a string.
 * @returns { Promise<{ privateJWK: string, publicJWK: string, cryptJWK: string }> }
*/
export async function createJWKs () {
  /** @type { CryptoKeyPair } */
  const { privateKey, publicKey } = await crypto.subtle.generateKey(importGenerateAlgorithm, true, ['sign', 'verify'])

  const cryptKey = await crypto.subtle.generateKey(cryptAlgorithm, true, ['encrypt', 'decrypt'])

  const [ privateJWK, publicJWK, cryptJWK ] = await Promise.all([ 
    crypto.subtle.exportKey('jwk', privateKey),
    crypto.subtle.exportKey('jwk', publicKey),
    crypto.subtle.exportKey('jwk', cryptKey)
  ])

  return {
    privateJWK: JSON.stringify(privateJWK),
    publicJWK: JSON.stringify(publicJWK),
    cryptJWK: JSON.stringify(cryptJWK),
  }
}
