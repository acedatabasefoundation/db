/** @returns { string } */
export function getTsIndex () {
  return `export * as td from './tsc/typedefs.js'
export * as enums from './tsc/enums.js'
`
}

/** @returns { string } */
export function getJsIndex () {
  return `export * as td from './typedefs.js'
export * as enums from './enums.js'
`
}