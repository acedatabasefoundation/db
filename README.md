<img src="./src/images/logo.png" width="100%" />


## 🙏 Our Mission
Create maintain and enhance, the Best database, for JavaScript Developers!


## 🧐 Why Ace?
* A graph is a **natural** data storage technique, that connects nodes **(neurons)** with relationships **(synapses)** 🧠
* Ace unites the following lovely features, in an optionally [sponsored](#sponsor-ace) or optionally free 🙌, open source graph db:
    * **[Embeded](#embeded)** (no latency between application server and database)
    * **[Memory Storage](#storage)** (query millions of nodes in less then 9ms 😳)
    * **[File Storage](#storage)** (append memory storage to files)
    * **[Transactions](#transactions)** (start, continue, cancel or complete txn's)
    * **[Queue](#queue)** (provides read and write concurrency)
    * **[Schema](#schema)** (define data shape w/ JSON)
    * **[Migrations](#migrations)** (simple and powerful schema migrations within and between environments)
    * **[Backups](#backups)** (multiple locations and frequencies available)
    * **[TypeScript and JSDoc](#typescript-and-jsdoc)** (based on schema to provide helpful editor intellisense)
    * **[CLI](#cli)** (geneate types, perform migrations and much more)
    * **[Data Types](#data-types)** (string, number, boolean, iso, hash, encrypt)
    * **[ORM](#orm)** (unite the query language and the ORM with the function `ace()`, that allows multiple, interrelated and typesafe, queries and mutations)


## ☁️ Getting Stated
1. Download Ace
    * Have an existing NodeJS application, or in bash start a new one with `npm init` or `npm create vite@latest`
    * In bash navigate to the folder where the `package.json` is and `npm i @ace/db`
    * This will download `v0.0.1`
    * Ace will be production recommended when we release `v1.0.0`
    * No migrations scripts are planned for any version between now and `v1.0.0`
1. Create a Graph
    * [Create a WhatsApp Graph](#create-a-whatsapp-graph)
    * [Create an Instagram Graph](#create-an-instagram-graph)
    * [Create a Stack Overflow Graph](#create-a-sessions-graph)
    * [Create a Sessions Graph](#create-a-sessions-graph)
    * [Create an eCommerce Graph](#create-an-ecommerce-graph)
    * [Create a Blog Graph](#create-a-blog-graph)


## Examples
1. Query
    * [Alias](#alias)
    * [Relationship](#relationship)
    * [Select Star](#select-star)
    * [Find](#find)
    * [Filter](#filter)
    * [Limit](#limit)
    * [Sort](#sort)
    * [Flow](#flow)
    * [Math](#math) - Count / Sum / Average / Min / Max
    * [Adjacent to Response](#adjacent-to-response)
    * [As Response](#as-response)
    * [New Props](#new-props)
    * [Response Hide](#response-hide)
1. Mutations
    * [Insert](#inset)
    * [Update](#update)
    * [Upsert](#upsert)
    * [Delete](#delete)
1. Schema
    * [Unique Index](#unique-index)
    * [Sort Index](#sort-index)
    * [Must Be Defined](#must-be-defined)
    * [Must Be Unique](#must-be-unique)
    * [Default Value](#default-value)
1. [Relationship Props](#relationship-props)
1. [Encrypt PII](#encrypt-pii)
1. [Multi Graph Support](#multi-graph-support)


## Create a WhatsApp Graph
1. Create the schema
```js
import { ace } from '@ace/db'


await ace({
  // directory that holds graph information
  dir: './ace',

  // current environment (allows the ability to have different schema versions in different environements) (recommend something like process.env.NODE_ENV here)
  env: 'local',

  // req array order is the order the graph will be updated
  req: [
    // empty any existing items in the graph
    { do: 'EmptyGraph' },

    // add nodes, relationships and props to schema
    {
      do: 'SchemaAdd',
      how: {
        nodes: {
          User: 
            name: { is: 'Prop', options: { dataType: 'string', mustBeDefined: true } }, // User prop
            friends: { is: 'BidirectionalRelationshipProp', options: { has: 'many', node: 'User', relationship: 'isFriendsWith' } } // User prop
          },
        },
        relationships: {
          isFriendsWith: { is: 'ManyToMany' },
        }
      }
    }
  ]
})
```
2. View updates in `schemas` folder
    * Navigate to `./ace/schemas/` and view `details.json` and `1.json`
    * Each schema alteration will create a new file in this directory with the updated schema and update the `details.json`
2. In bash do: `ace types ./ace local`
    * This will update your types to include your updated schema
2. Mutate and Query Graph
    * Press `Control+Space` to get intellisense
```js
const res = await ace({
  dir: './ace',
  req: [
    // insert nodes
    { do: 'NodeInsert', how: { node: 'User', props: { id: '_:Alpha',  name: 'Alpha' } } },
    { do: 'NodeInsert', how: { node: 'User', props: { id: '_:Omega',  name: 'Omega' } } },

    // insert relationships
    { do: 'RelationshipInsert', how: { relationship: 'isFriendsWith', props: { a: '_:Alpha', b: '_:Omega' } } },

    // query users
    {
      do: 'NodeQuery',
      how: {
        node: 'User',
        resKey: 'users', // in the response, @ key users, put the value of this query
        resValue: { // how the query value will be formatted
          id: true,
          name: true,
          friends: {
            id: true,
            name: true,
          }
        }
      }
    }
  ]
})
```
5. Log Response
```js
console.log(res)


{
  "$ace": {
    "enumIds": { // aligns enum id's from mutations above w/ graph id's
      "_:Alpha": 1,
      "_:Omega": 2
    },
  },
  "users": [ // this is "users" b/c of the resKey above
    {
      "id": 1,
      "name": "Alpha",
      "friends": [
        {
          "id": 2,
          "name": "Omega"
        }
      ]
    },
    {
      "id": 2,
      "name": "Omega",
      "friends": [
        {
          "id": 1,
          "name": "Alpha"
        }
      ]
    }
  ]
}
```

## Embeded
* Data is stored in memory and in the directory you specify on your application server
* This allows for no network latency between your application server and your database
```js
await ace({ dir: './ace', req: [ ... ] }) // dir = the directory, starting from your applications package.json
```


## Storage
* Memory
    * The max size v8 allows for a `new Map()` is 1 gigabyte
    * Ace puts the most recent 45 megabytes of writes (estimated 3+ million graph items) into an in memory map
    * Querying the in memory map allows 1ms queries at its max size
    * If the application server restarts, the map is rebuilt thanks to the write ahead log
* File
    * To the specified directory:
        * When a request or a transaction is succesful, data updates are:
            * Appended to the write ahead log (file)
                * Writes are fast b/c file append is fast
            * Added to the write ahead log map (memory)
        * When the write ahead log map reaches 45 megabytes
            * Keys are sorted (to allow binary searching) and written to an immutable file
            * Write ahead log map is cleared
            * Write ahead log file is cleared


## Transactions
* When a call to `ace()` starts a transaction (txn) the response will include a `txnId` as seen below
* Use the `txnId` to continue, cancel or complete a txn
* If a txn has been running for 9 seconds, ace will cancel it, throw a timeout error, and begin the next request in the [queue](#queue)
```js
import { ace } from '@ace/db'

// start txn
const res = await ace({ txn: { do: 'Start' }, dir: './ace', req: { ... } })

// continue txn
await ace({ txn: { id: res.$ace.txnId }, dir: './ace', req: { ... } })

// cancel txn
await ace({ txn: { id: res.$ace.txnId, do: 'Cancel' }, dir: './ace' })

// complete txn
await ace({ txn: { id: res.$ace.txnId, do: 'Complete' }, dir: './ace', req: { ... } })

// completing a txn after cancelling it does not make sense btw, above is just to show all available txn options
```


## Queue
* If a request or a transaction (txn) is in progress, incoming requests are put into a queue
* The difference between a request and a txn is:
    * A request is a call to `ace()` that does not start a txn
    * A txn is a call to `ace()` that starts a txn or continues a txn


## Schema
* Specify the nodes and relationships of your graph
* If schema changes are made via `ace()`, data changes are applied and a version of the new schema is put into the directory you choose


## Migrations
* With our cli you may simply apply different versions of your schema to your graph


## TypeScript and JSDoc
* Thanks to our CLI and your schema `ace types` generates types for TypeScript developers and JSDoc typedefs for JavaScript developers 
* Types are based on your schema and provide guidance during calls to `ace()`


## CLI
```bash
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
```


## Data Types
* string
* number
* boolean
* iso
    * Equivalent to: `(new Date()).toISOString()`
* hash
    * Get jwks via `ace jwks`
    * When doing an inserrt, update, or upsert to `ace()` for a hash data type send a private jwk
    * When doing a match query to `ace()` on a hashed value send the public jwk
