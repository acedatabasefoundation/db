/**
 * @param { string } version
 * @returns { void }
 */
export function getHelp (version) {
  console.log(`@ace/db v${ version }


ace help
  - Show this message


ace jwks
  - A jwk (JSON Web Key) is like a password. JWKs helps Ace do cryptography
  - Use ACE_PRIVATE_JWK to create a hash, use ACE_PUBLIC_JWK to verify a hash and use ACE_CRYPT_JWK to encrypt and decrypt information
  - Ace recommends storing JWKs in your .env file as a string


ace trash:empty ./ace
  - Empty trash folder
  - This is where we put the contents of your ./ace folder when you call Empty w/ ace()
  - Path is required, it's relative to your package.json and is what your folder name is


ace types
ace types ./ace local
  - Create types (TS) and typedefs (JSDoc)
  - Path is optional, it's relative to your package.json and is what your folder name is
  - Env is optinal and it's your process.env.NODE_ENV. Env allows different schema versions in different environments (eg: local, qa, prod)
  - If path & env are included, types are schema specific


ace -v
ace version
  - Prints your currently downloaded Ace Graph Database Version

`)
}