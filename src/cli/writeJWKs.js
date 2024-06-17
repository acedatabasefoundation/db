import { stdout } from 'node:process'
import { createJWKs } from '../security/createJWKs.js'


/** @returns { Promise<void> } */
export async function writeJWKs () {
  const jwks = await createJWKs()

  stdout.write(`JWKs
  1. A jwk (JSON Web Key) is like a password and helps Ace do cryptography
  2. Use \`ACE_PRIVATE_JWK\` to create a hash, use \`ACE_PUBLIC_JWK\` to verify a hash and use \`ACE_CRYPT_JWK\` to encrypt and decrypt data
  3. Ace recommends storing JWKs in your .env file as a string and then closing this terminal window


ACE_PRIVATE_JWK='${ jwks.privateJWK }'

ACE_PUBLIC_JWK='${ jwks.publicJWK }'

ACE_CRYPT_JWK='${ jwks.cryptJWK }'`)
}
