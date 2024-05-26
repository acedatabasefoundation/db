import { uint8ToBase64 } from './transmute.js'


/**
 * Use `getRandomBase64()` to get a hash salt.
 * At `./src/security/hash/sign()` (how we create a hash for the hash graph data type) we do not automatically add a salt to the hash b/c we don't know if you are storing the salt.
 * If you would love to use a salt with your hash call `getRandomBase64()`, append the salt to the message before adding it to the graph, and then add the salt into your graph.
 */
export function getRandomBase64 () {
  return uint8ToBase64(crypto.getRandomValues(new Uint8Array(16)))
}
