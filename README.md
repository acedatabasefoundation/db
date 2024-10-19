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
    * To get started you'll need an existing NodeJS application, or in bash start a new one with `npm init` or `npm create vite@latest`
    * As a dependency in you `package.json` add `"@ace/db": "git+https://github.com/acedatabasefoundation/db.git",`
        * There are more features I'd love to add before putting this on NPM
    * Bash: `npm i`
1. [Create a WhatsApp Graph](#create-a-whatsapp-graph)


## Current Features

### Create a schema
```js
await ace({
  dir,
  env,
  req:  {
    do: 'SchemaAdd',
    how: {
      nodes: {
        User: {
          name: { is: 'Prop', options: { dataType: 'encrypt', mustBeDefined: true } }, // The name on file will be encrypted but we can still do things like find all users with a name of Chris
          email: { is: 'Prop', options: { dataType: 'encrypt', uniqueIndex: true } }, // We can even place an index on encrypted data to help if we want to get users by email frequently
          password: { is: 'Prop', options: { dataType: 'hash', uniqueIndex: true } }, // Hash is a great data type to allow us to check if a password matches but never be able to decrypt the password
          isAwesome: { is: 'Prop', options: { dataType: 'boolean', uniqueIndex: true } }, // Booleans are inserted and queried as true & false
          createdAt: { is: 'Prop', options: { dataType: 'iso', mustBeDefined: true, default: 'now' } }, // The iso dataType is an isoString (date time string format that includes timezone)
          age: { is: 'Prop', options: { dataType: 'number', sortIndex: true } }, // sortIndex will ensure reads are fast wheb we ask Ace for users sorted by age
          friends: { is: 'BidirectionalRelationshipProp', options: { has: 'many', node: 'User', relationship: 'isFriendsWith' } }, // BidirectionalRelationshipProp means from any perspective of the relationship is it called the same. So if we are friends, from your and my perspective, we are friends
          following: { is: 'ForwardRelationshipProp', options: { has: 'many', node: 'User', relationship: 'isFollowing' } }, // ForwardRelationshipProp means from this perspective of the relationship we align with the relationship name. So if I follow you, from my perspective I am following and from your perspective you are the followee
          followers: { is: 'ReverseRelationshipProp', options: { has: 'many', node: 'User', relationship: 'isFollowing' } }, // ReverseRelationshipProp means from this perspective of the relationship we are backwards with the relationship name.
        },
      },
      relationships: {
        isFriendsWith: { is: 'ManyToMany' },
        isFollowing: { is: 'ManyToMany' },
      }
    }
  }
})
```

### Mutation: Insert
1. Add 2 User nodes to graph
1. Add a relationship between the 2 nodes
1. Details about the example below:
    * When an id starts with `_:` this is an enum identifying id which can be used in relaitonships
    * For a relationship insert we need to know the direction, who is following who, in this case `Chris` isInLoveWith `Mercy` b/c `a` is following `b`
    * `req` is shown as an array in the example below, if you'd love Ace to do 1 thing use an object & if you'd love Ace to do multiple things use an array and the items will be done in the provided order
```ts
await ace({
  dir,
  env,
  req: [
    { do: 'NodeInsert', how: { node: 'User', props: { id: '_:chris', name: 'Chis' } } },
    { do: 'NodeInsert', how: { node: 'User', props: { id: '_:mercy', name: 'Mercy' } } },
    { do: 'RelationshipInsert', how: { relationship: 'isFollowing', props: { a: '_:chris', b: '_:mercy' } } }
  ]
})
```


### Mutation: Update / Upsert
* All the options below are with `Update`, so if the `id` does not exist an error will throw, to avoid the throw, switch `Update` for `Upsert` below
1. At `id: 1` update the name of that node to `Christopher` 
1. At `id: 2` update the name of that node to `Miss Lovely` 
1. At `id: 3` update the direction of that relationship
```ts
await ace({
  dir,
  env,
  req: [
    { do: 'NodeUpdate', how: { node: 'User', props: { id: 1, name: 'Chistopher' } } },
    { do: 'NodeUpdate', how: { node: 'User', props: { id: 2, name: 'Miss Lovely' } } },
    { do: 'RelationshipUpdate', how: { relationship: 'isFollowing', props: { id: 3, a: '_:mercy', b: '_:chris' } } }
  ]
})
```


### Mutation: Delete
* Here are the many different ways we may delete data:
```ts
await ace({
  dir,
  env,
  req: [
    { do: 'NodeDelete', how: [ 1, 2 ] }, // delete the nodes that have an id of 1 and 2
    { do: 'NodePropDelete', how: { ids: [ 3, 4 ], props: [ 'name' ] } }, // delete the prop of name from nodes 3 and 4

    { do: 'RelationshipDelete', how: { _ids: [ 5 ] } }, // delete the relationship with _id 5
    { do: 'RelationshipPropDelete', how: { _ids: [ 6 ], props: [ '_createdAt' ] } }, // delete the _createdAt prop from _id 6

    { do: 'SchemaDeleteNodes', how: [ 'Actor' ] }, // Delete the Actor node in the schema AND delete all Actor data from graph
    { do: 'SchemaDeleteNodeProps', how: [ { node: 'Actor', prop: 'name' } ] }, // Delete the name prop from the Actor node in the schema AND delete all Actor > name props in the graph
  ]
})
```


### Query: Alias
* Notice the `alias` below at `req > how > resValue > name`?!
* In the schema the property is `name` but in the response it will be `fullName`
* Note: `req` in the code example above is an array but below is an object, if you'd love Ace to do 1 thing use an object & if you'd love Ace to do multiple things use an array and the items will be done in the provided order
```ts
const { products } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'Movie',
      resKey: 'movies',
      resValue: {
        id: true,
        name: { alias: 'fullName' },
      }
    }
  }
})
```


### Query: Select Star
* Notice the `'*'` @ `resValue` below?!
* A value of `'*'` as the `resValue` will ensure that all the none relationship properties for a movie are included
* A value of `'**'` as the `resValue` will ensure that all the none relationship properties for a movie are included and one level deep of relationship props (and all their none relationship properties will be included)
* A value of `'***'` as the `resValue` will ensure that all the none relationship properties for a movie are included and ***TWO*** levels deep of relationship props (and all their none relationship properties will be included)
```ts
const { products } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'Movie',
      resKey: 'movies',
      resValue: '*'
    }
  }
})
```



### Query: Relationships
* Ace can query nodes (meaning we start from a node) like the example above where we start at the `movies` node or can start at a relationship like this:
* Relationships sit between 2 nodes, so when we query by a relationship the first 2 props point to the 2 nodes this relationship sits between
```ts
const { hasStaredIn } = await ace({
  dir,
  env,
  req: {
    do: 'RelationshipQuery',
    how: {
      relationship: 'hasStaredIn',
      resKey: 'hasStaredIn',
      resValue: {
        movie: '*',
        actor: '**'
      }
    }
  }
})
```



### Query: Find
* Find Node by `id`
```ts
const { users } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: { findById: 1 },
        id: true,
        name: true,
      }
    }
  }
})
```

* Find the first user that has a name of `Chris`
```ts
const { users } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: { findByPropValue: [ { prop: 'name' }, 'equals', 'Chris' ] },
        id: true,
        name: true,
      }
    }
  }
})
```

* Find the first user that has a name of `Chris` and an email that ends in `@gmail.com`
* To do this as an `or` switch `findByAnd` to `findByOr`
```ts
const { users } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: { findByAnd: [ [ { prop: 'name' }, 'equals', 'Chris' ], [ { prop: 'email' }, 'endsWith', '@gmail.com' ] ] },
        id: true,
        name: true,
        email: true,
      }
    }
  }
})
```


### Query: Filter
* Filter users that have a name of `Chris`
```ts
const { users } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: { filterByPropValue: [ { prop: 'name' }, 'equals', 'Chris' ] },
        id: true,
        name: true,
      }
    }
  }
})
```

* Filter users that have a name of `Chris` and an email that ends in `@gmail.com`
* To do this as an `or` switch `filterByAnd` to `filterByOr`
```ts
const { users } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: { filterByAnd: [ [ { prop: 'name' }, 'equals', 'Chris' ], [ { prop: 'email' }, 'endsWith', '@gmail.com' ] ] },
        id: true,
        name: true,
        email: true,
      }
    }
  }
})
```


### Query: Limit
* Skip the first 9 users and then show the next 9 users
```ts
const { users } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: { limit: { count: 9, skip: 9 } },
        id: true,
        name: true,
      }
    }
  }
})
```


### Query: Sort
* Sort users `asc` by name
* To sort descending switch `asc` for `dsc`
```ts
const { users } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: { sort: { how: 'asc', prop: 'name' } },
        id: true,
        name: true,
      }
    }
  }
})
```


### Query: Flow
* There can be multiple options in `$o`
* There is a default order that Ace does the options (default order be found [here](https://github.com/acedatabasefoundation/db/blob/main/src/util/variables.js) @ defaultQueryOptionsFlow)
* For example the default flow is to do sort then limit, but if you'd love limit then sort:
```ts
const { users } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: {
          flow: [ 'limit', 'sort' ],
          limit: { count: 9 },
          sort: { how: 'asc', prop: 'name' }
        },
        id: true,
        name: true,
      }
    }
  }
})
```


### Query: Count
* Add a `count` (of all users) property to each user object in the response:
```ts
const { users } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: { countAsProp: 'count' },
        id: true,
        name: true,
      }
    }
  }
})
```
* Add a `count` property ***ADJACENT*** to the `users` property
* Notice the const is now `const { users, userCount }`?!
```ts
const { users, userCount } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'users',
      resValue: {
        $o: { countAdjToRes: 'userCount' },
        id: true,
        name: true,
      }
    }
  }
})
```

* At the provided `resKey` give the `count`:
```ts
const { userCount } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'User',
      resKey: 'userCount',
      resValue: {
        $o: { countAsRes: true },
      }
    }
  }
})
```


### Query: Sum
* Add a `totalRevenue` (of all accounts) property to each account object in the response:
```ts
const { accounts } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'BankAccount',
      resKey: 'accounts',
      resValue: {
        $o: {
          sumAsProp: { computeProp: 'revenue', newProp: 'totalRevenue' }
        },
        id: true,
        revenue: true,
      }
    }
  }
})
```

* Get the sum revenue and then place it at the provided `resKey`:
```ts
const { totalRevenue } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'BankAccount',
      resKey: 'totalRevenue',
      resValue: {
        $o: { sumAsRes: 'revenue' }
      }
    }
  }
})
```


### Query: Average
* Add an `avgRevenue` (of all accounts) property to each account object in the response:
```ts
const { accounts } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'BankAccount',
      resKey: 'accounts',
      resValue: {
        $o: {
          avgAsProp: { computeProp: 'revenue', newProp: 'avgRevenue' }
        },
        id: true,
        revenue: true,
      }
    }
  }
})
```

* Get the average revenue and then place it at the provided `resKey`:
```ts
const { avgRevenue } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'BankAccount',
      resKey: 'avgRevenue',
      resValue: {
        $o: { avgAsRes: 'revenue' }
      }
    }
  }
})
```


### Query: Min / Max
* All examples below will use `min`
* If you'd love `max` just switch `min` to `max` anywhere you see `min` in the code examples
* Calculate lowest value for the `revenue` prop (of all accounts) and then add the `minRevenue` that will hold this lowest value to each account object in the response:
```ts
const { accounts } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'BankAccount',
      resKey: 'accounts',
      resValue: {
        $o: { minAmtAsProp: { computeProp: 'revenue', newProp: 'minRevenue' } },
        revenue: true,
      }
    }
  }
})
```

* Calculate lowest value for the `revenue` prop (of all accounts) and then provide that node in the response
* Notice how the const changed from `accounts` above to `account` below b/c now we are only returning one node (the least revenue node), so we removed the `s` from `accounts` in the `resKey`
```ts
const { account } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'BankAccount',
      resKey: 'account',
      resValue: {
        $o: { minNodeAsRes: 'revenue' },
        id: true,
        revenue: true,
      }
    }
  }
})
```

* Calculate lowest value for the `revenue` prop (of all accounts) and then provide that value as the response:
```ts
const { lowestRevenue } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'BankAccount',
      resKey: 'lowestRevenue',
      resValue: {
        $o: { minAmtAsRes: 'revenue' }
      }
    }
  }
})
```


### Query: New Props
* Add a profit column to each account in the response
* The first property in the newProps object is the name of the new props, below it is `profit`
* In the `profit` value you see `subtract` below, the other options are `[ add, subtract, multiply, divide ]`
```ts
const { accounts } = await ace({
  dir,
  env,
  req: {
    do: 'NodeQuery',
    how: {
      node: 'BankAccount',
      resKey: 'accounts',
      resValue: {
        $o: {
          newProps: {
            profit: { subtract: [ 'revenue', 'expenses' ] },
          }
        },
        revenue: true,
        expenses: true,
      }
    }
  }
})
```


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
