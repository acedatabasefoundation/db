/**
 * @param { string } version
 * @returns { void }
 */
export function getHelp (version) {
  console.log(`@ace/node v${ version }


ace
  Show this message
  How:
    ace
    ace -h
    ace help


ace version
   Prints your currently downloaded Ace Graph Database Version
  How:
    ace -v
    ace version


ace jwks
  - A jwk (JSON Web Key) is like a password and helps Ace do cryptography
  - Use ACE_PRIVATE_JWK to create a hash, use ACE_PUBLIC_JWK to verify a hash and use ACE_CRYPT_JWK to encrypt and decrypt data
  - Ace recommends storing JWKs in your .env file as a string
  How:
    ace -j
    ace jwks


ace types
  Create types (TS) and typedefs (JSDoc)
  How:
    ace -t
    ace types
`)
}