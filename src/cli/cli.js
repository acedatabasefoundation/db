#!/usr/bin/env node


import { stdout } from 'node:process'
import { getHelp } from './getHelp.js'
import { writeJWKs } from './writeJWKs.js'
import { emptyTrash } from './trash.js'
import { fileURLToPath } from 'node:url'
import { cliTypes } from './cliTypes.js'
import { writeToken } from './writeToken.js'
import { getVersion } from './getVersion.js'
import { dirname, resolve } from 'node:path'
import { schemaPush } from './schemaPush.js'
import { getRandomBase64 } from '../security/getRandomBase64.js'


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


      case 'version':
        stdout.write(await getVersion(packageDotJson))
        break


      case 'jwks':
        await writeJWKs()
        break


      case 'base64':
        stdout.write(getRandomBase64() + '\n')
        break


      case 'token':
        writeToken()
        break


      case 'types':
        await cliTypes()
        break


      case 'trash:empty':
        await emptyTrash()
        break


      case 'schema:push':
        await schemaPush()
        break
    }
  } catch (error) {
    console.log('error:', error)
  }
})()
