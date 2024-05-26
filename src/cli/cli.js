#!/usr/bin/env node


import { cliTypes } from './cliTypes.js'
import { getHelp } from './getHelp.js'
import { logJWKs } from './logJWKs.js'
import { fileURLToPath } from 'node:url'
import { getVersion } from './getVersion.js'
import { dirname, resolve } from 'node:path'


(async function cli () {
  try {
    const root = '../../'
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const packageDotJson = resolve(__dirname, root + 'package.json')


    switch (process.argv[2]) {
      case '-v':
      case 'version':
        console.log(await getVersion(packageDotJson))
        break


      case '-j':
      case 'jwks':
        await logJWKs()
        break


      case '-t':
      case 'types':
        await cliTypes(process.argv[3])
        break


      case '-h':
      case 'help':
      default:
        getHelp(await getVersion(packageDotJson))
        break
    }
  } catch (error) {
    console.log('error', error)
  }
})()
