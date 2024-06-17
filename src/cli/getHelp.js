import { stdout } from 'node:process'


/**
 * @param { string } version
 * @returns { void }
 */
export function getHelp (version) {
  stdout.write(`@ace/db v${ version }


ace help
  - Show this message


ace jwks
  - A jwk (JSON Web Key) is like a password. JWKs helps Ace do cryptography
  - Use ACE_PRIVATE_JWK to create a hash, use ACE_PUBLIC_JWK to verify a hash and use ACE_CRYPT_JWK to encrypt and decrypt information
  - Ace recommends storing JWKs in your .env file as a string and then closing this terminal window


ace trash:empty
  - Empty trash folder
  - When ace() EmptyGraph is called, items are moved into the trash folder: [ directory ]/trash/[ timestamp ]


ace token
  - The Ace CLI could read and write to the directory that holds your graph without calling your server
  - But the server holds a request queue that ensures all requests happen one at a time, in the order they are recieved
  - So the Ace CLI calls your graph by calling an endpoint on your server, so that the CLI requests goes into the queue
  - To ensure the endpoint to your graph, on your server, is only accessible to the ClI, use this token
  - Ace recommends storing this token in your .env file as a string and then closing this terminal window


ace types
  - Creates enums, types (TS) and typedefs (JSDoc)
  - To access in your application
    - import { td, enums } from "@ace/db"


ace schema:push
  - Example:
    - Local schema version is 3
    - Local application code is pushed to production and includes [ directory ]/schemas/[1,2,3].json
    - Goal: Set production schema from version 1 to version 3
    - Bash: ace schema:push
      - First Ace will update graph data to reflect [ directory ]/schemas/2.json
      - Then Ace will update graph data to reflect [ directory ]/schemas/3.json
    - Aim version can be above or below the current version


ace version
  - Prints your currently downloaded Ace Graph Database Version
\n\n`)
}