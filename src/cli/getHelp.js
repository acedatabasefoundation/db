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
  - Where we put items when ace() Empty is called
  - First property (required), is the "directory" that holds your graph


ace types
ace types ./ace local
  - Create types (TS) and typedefs (JSDoc)
  - First property (optional), is the "directory" that holds your graph
  - Second property (optional), is the "environment" that we are in
  - If "directory" & "environment" are included, types are schema specific


ace schema:push ./ace production 1,2,3
  - If local schema updated to version 3, we push to production and now we want the production schema to go from version 1 to version 3
  - First property (required), is the "directory" that holds your graph
  - Second property (required), is the "environment" that we are in
  - Thrid property (required), is the "version movement". Examples:
      - Version 8 to Version 9 -> 8,9
      - Version 2 to Version 1 -> 2,1
      - Version 7 to Version 8 to Version 9 -> 7,8,9


ace -v
ace version
  - Prints your currently downloaded Ace Graph Database Version

`)
}