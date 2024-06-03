<img src="./src/images/logo.png" width="100%" />


## 🙏 Our Mission
Create maintain and enhance, the Best database, for JavaScript Developers!


## Why Ace?
* A graph is a natural data storage technique, that connects nodes (neurons) with relationships (synapses)
* Ace is an open source graph database, that unites the following lovely features, from impressive database leaders:
    * [Redis](https://redis.io/): Fast memory storage
    * [SQLite](https://www.sqlite.org/): No network latency between the application server & the database
    * [Drizzle](https://orm.drizzle.team/): Helpful schema lead intellisense
    * [Dgraph](https://dgraph.io/): Perform multiple interrelated mutations & queries in one request
    * [PlanetScale](https://planetscale.com/): Simple & powerful migrations


## Ace Features
1. [Embeded](#embeded)
1. [Memory Storage](#storage)
1. [File Storage](#storage)
1. [Transactions](#transactions)
1. [Queue](#queue)
1. [Schema](#schema)
1. [Migrations](#migrations)
1. [TypeScript and JSDoc](#typescript-and-jsdoc)
1. [CLI](#cli)
1. [Data Types](#data-types)


## ☁️ Getting Stated
1. Download Ace
    * Have an existing NodeJS application, or in bash start a new one with `npm init` or `npm create vite@latest`
    * In bash navigate to the folder where you `package.json` is and `npm i @ace/db`
    * This will download `v0.0.1`
    * Ace will be production recommended when we release `v1.0.0`
    * No migrations scripts are planned for any version between now and `v1.0.0`
1. Create a Graph
    * [Create a Facebook Graph](#create-a-facebook-graph)
    * [Create an Instagram Graph](#create-an-instagram-graph)
    * [Create a Blog Graph](#create-a-blog-graph)
    * [Create an eCommerce Graph](#create-an-ecommerce-graph)


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


## Create a Facebook Graph
1. Create the schema
```js
import { ace } from '@ace/db'


await ace({
  path: './ace',
  what: [
    // empty any existing items in the graph
    { do: 'Empty' },

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
2. In bash do: `ace types ./ace`
    * This will update your types to include your updated schema
2. Mutate and Query Graph
    * Press `Control+Space` to get intellisense
```js
const res = await ace({
  path: './ace',
  what: [
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

## Create an Instagram Graph
```js
import { ace } from '@ace/db'


const res = await ace({
  path: './ace',
  what: [
    // empty any existing items in the graph
    { do: 'Empty' },

    // add these nodes, relationships and props to schema
    {
      do: 'SchemaAdd',
      how: {
        nodes: {
          User: {
            name: { is: 'Prop', options: { dataType: 'string', mustBeDefined: true } },
            following: { is: 'ForwardRelationshipProp', options: { has: 'many', node: 'User', relationship: 'isFollowing' } },
            followers: { is: 'ReverseRelationshipProp', options: { has: 'many', node: 'User', relationship: 'isFollowing' } },
          },
        },
        relationships: {
          isFollowing: { is: 'ManyToMany' },
        }
      }
    },

    // insert nodes
    { do: 'NodeInsert', how: { node: 'User', props: { id: '_:Source', name: 'Source' } } },
    { do: 'NodeInsert', how: { node: 'User', props: { id: '_:Helios', name: 'Helios' } } },
    { do: 'NodeInsert', how: { node: 'User', props: { id: '_:Vesta', name: 'Vesta' } } },

    // insert relationships
    { do: 'RelationshipInsert', how: { relationship: 'isFollowing', props: { a: '_:Helios', b: '_:Source' } } },
    { do: 'RelationshipInsert', how: { relationship: 'isFollowing', props: { a: '_:Vesta', b: '_:Source' } } },

    // query users
    {
      do: 'NodeQuery',
      how: {
        node: 'User',
        resKey: 'users',
        resValue: {
          id: true,
          name: true,
          followers: {
            id: true,
            name: true,
          },
          following: {
            id: true,
            name: true,
          }
        }
      }
    }

  ]
})


console.log(res)


{
  "$ace": {
    "enumIds": {
      "_:Source": 1,
      "_:Helios": 2,
      "_:Vesta": 3
    },
  },
  "users": [
    {
      "id": 1,
      "name": "Source",
      "followers": [
        {
          "id": 2,
          "name": "Helios"
        },
        {
          "id": 3,
          "name": "Vesta"
        }
      ]
    },
    {
      "id": 2,
      "name": "Helios",
      "following": [
        {
          "id": 1,
          "name": "Source"
        }
      ]
    },
    {
      "id": 3,
      "name": "Vesta",
      "following": [
        {
          "id": 1,
          "name": "Source"
        }
      ]
    }
  ]
}
```


## Embeded
* Data is stored in memory and in the directory you specify on your application server
```js
await ace({ path: './ace', what: [ ... ] }) // path = the directory, starting from your applications package.json
```


## Storage
* Memory
    * Max `new Map()` size allowed in v8 is 1GB
    * Most recent 21MB's of writes (estimated 300,000 to 1 million graph items) are stored in an in memory map
    * Querying the in memory map allows 1-20ms queries, even if 600,000 items are in the map
    * If the application server restarts, the map is rebuilt thanks to the write ahead log
* File
    * To the specified directory:
        * When a request or a transaction is succesful, data updates are:
            * Appended to the write ahead log (file)
            * Added to the write ahead log map (memory)
        * When the write ahead log map reaches 21MB's
            * Keys are sorted (to allow binary searching) and written to an immutable file (10-50ms average reads)
            * Write ahead log map is cleared
            * Write ahead log file is cleared


## Transactions
* When a call to `ace()` starts a transaction (txn) the response will include a `txnId` as seen below
* Use the `txnId` to continue, cancel or complete a txn
* If a txn has been running for 9 seconds, ace will cancel it, throw a timeout error, and begin the next request in the [queue](#queue)
```js
import { ace } from '@ace/db'

// start txn
const res = await ace({ txn: { do: 'Start' }, path: './ace', what: { ... } })

// continue txn
await ace({ txn: { id: res.$ace.txnId }, path: './ace', what: { ... } })

// cancel txn
await ace({ txn: { id: res.$ace.txnId, do: 'Cancel' }, path: './ace' })

// complete txn
await ace({ txn: { id: res.$ace.txnId, do: 'Complete' }, path: './ace', what: { ... } })

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
  - Ace recommends storing JWKs in your .env file as a string


ace trash empty ./ace
  - Empty trash folder
  - This is where we put the contents of your ./ace folder when you call Empty w/ ace()
  - Path is required, it's relative to your package.json and is what your folder name is


ace types
ace types ./ace
  - Create types (TS) and typedefs (JSDoc)
  - Path is optional, it's relative to your package.json and is what your folder name is
  - If path is included, types are schema specific


ace -v
ace version
  - Prints your currently downloaded Ace Graph Database Version
```


## Data Types
* string
* number
* boolean
* isoString
    * Equivalent to: `(new Date()).toISOString()`
* hash
    * Get jwks via `ace jwks`
    * When doing an inserrt, update, or upsert to `ace()` for a hash data type send a private jwk
    * When doing a match query to `ace()` on a hashed value send the public jwk
