<img src="./src/images/logo.png" width="100%" />


## 🙏 Our Mission
Create maintain and enhance, the Best database, for JavaScript Developers!


## 🧐 Why Ace?
* A graph is a **natural** data storage technique, that connects nodes **(neurons)** with relationships **(synapses)** 🧠
* Ace unites the following lovely features, in a free, open source, graph db:
    * **[Embeded](#embeded)** (no network latency between the application server and the database)
    * **[Memory Storage](#storage)** (query millions of nodes in less then 9ms 😳)
    * **[File Storage](#storage)** (append memory storage to files)
    * **[Transactions](#transactions)** (start, continue, cancel or complete txn's)
    * **[Queue](#queue)** (provides read and write concurrency)
    * **[Schema](#schema)** (define data shape w/ JSON)
    * **[Migrations](#migrations)** (simple and powerful schema migrations within and between environments)
    * **[Backups](#backups)** (multiple locations and frequencies available)
    * **[TypeScript and JSDoc](#typescript-and-jsdoc)** (provides helpful editor intellisense & is based on your schema)
    * **[CLI](#cli)** (geneate types, perform migrations and much more)
    * **[Data Types](#data-types)** (string, number, boolean, iso, hash, encrypt)
    * **[ORM](#orm)** (the query language and the ORM are bundled in the typesafe function, `ace()`)


## ☁️ Getting Stated
1. Download Ace
    * Have an existing NodeJS application, or in bash start a new one with `npm init` or `npm create vite@latest`
    * As a dependency in you `package.json` add `"@ace/db": "git+https://github.com/acedatabasefoundation/db.git",`
        * There are more features I'd love to add before putting this on NPM
    * Bash: `npm i`
1. [Create a WhatsApp Graph](#create-a-whatsapp-graph)


## Current Features
1. Query
    * Alias
        * According to the schema the node prop might be User > name but thanks to alias, the response can be User > fullName
    * Relationship
        * Create and query relationships that are called the same thing from either direction, like a `friend`, or have different names from either direction like `follower` and `folowee`
    * Select Star
    * Find
    * Filter
    * Limit
    * Sort
    * Flow
        * Use default flow or set in query the flow of options
        * Example sort then limit (default) or limit then sort (optional)
    * Math
        * Count / Sum / Average / Min / Max
        * Example, let's say we are calculating the count of users, any math value like `count` can be added:
            * As an object property: `{ users: [ { name: 'AUM', count: 1 } ] }` 
            * Adjacent to the response: `{ count: 1, users: [ { name: 'AUM' } ] }` 
            * As the response: `1` 
    * Adjacent to Response
        * In ace multiple responses can be in one query
        * Example { totalUserCount: 9, paginatedUsers: [] }
        * In the above response we can say place `totalUserCount` adjacent in the response to `paginatedUsers`
    * As Response
        * You can say take a value and place it as the response
        * Example, there are 9 users, so `As Response` allows the response to be 9, not an object { userCount: 9 }, or {users: [] } and we get the length of the array, nope the response is just 9
    * New Props
        * Calculate values using the standard math operators to create new props in the response
        * Example: Revenue and Expenses are in the response already, `New Props` allows us to add Profit to the response
    * Response Hide
        * There might be values in the response that we wanted for a calucation but when the calucation is done we don't actually want the item in the response
        * Example: Revenue and Expenses are in the response already, `New Props` allows us to add Profit to the response, and then `Response Hide` allows us to remove Revenue and Expenses from the response and just show the Profit
1. Mutations
    * Insert
    * Update
    * Upsert
    * Delete
1. Schema
    * Must Be Defined
    * Default Value
    * Must Be Unique
    * Unique Index
    * Sort Index
1. Relationship Props
    * Example: Imagine a graph with an Actor node, a Movie node and a actedIn relationship. An example of a relationship prop would be salary. The prop does not really fit on either node, but perfectly with the relationship
1. Encrypt PII
    * Can still be searched and filtered on
    * Data on file is encrypted


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
2. In bash do: `ace types`
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
    * Ace puts writes into a sorted array to allow binary searching later, and an append only file
    * If the application server restarts, the array is rebuilt thanks to the append only file
* File
    * To the specified directory:
        * When a request or a transaction is succesful, data updates are:
            * Appended to the append only file
                * Writes are fast b/c file append is fast
            * Added to the append only file map (memory)


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
  - To access types or enums in your application just add to any file:
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


## ORM
* The shape of the data in the query is the shape of the object in the response
* In the example below:
    * The `resKey` or Response Key is `products` so they're stored at `const { products }`
    * Each product will have `id`, `name` and `amount` in the response
```ts
const { products } = await ace({
  env: process.env.NODE_ENV,
  dir: process.env.ACE_DIRECTORY,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'Product',
      resKey: 'products',
      resValue: {
        id: true,
        name: true,
        price: { alias: 'amount' },
      }
    }
  }
})
```
