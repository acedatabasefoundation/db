#!/usr/bin/env node


import { getHelp } from './getHelp.js'
import { logJWKs } from './logJWKs.js'
import { emptyTrash } from './trash.js'
import { fileURLToPath } from 'node:url'
import { cliTypes } from './cliTypes.js'
import { getVersion } from './getVersion.js'
import { dirname, resolve } from 'node:path'


(async function cli () {
  try {
    const root = '../../'
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const packageDotJson = resolve(__dirname, root + 'package.json')


    switch (process.argv[2]) {
      case 'help':
      default:
        getHelp(await getVersion(packageDotJson))
        break


      case '-v':
      case 'version':
        console.log(await getVersion(packageDotJson))
        break


      case 'jwks':
        await logJWKs()
        break


      case 'types':
        await cliTypes(process.argv[3], process.argv[4])
        break


      case 'trash:empty':
        await emptyTrash(process.argv[3])
        break
    }
  } catch (error) {
    console.log('error', error)
  }
})()
