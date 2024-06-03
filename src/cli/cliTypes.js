import util from 'node:util'
import { ace } from '../ace/ace.js'
import { fileURLToPath } from 'node:url'
import { getEnums } from './getEnums.js'
import { exec } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { getTypedefs } from './getTypedefs.js'
import { getTsConfig } from './getTsConfig.js'
import { getJsIndex, getTsIndex } from './getIndex.js'


/**
 * @param { string } [ path ] 
 */
export async function cliTypes (path) {
  const root = '../../'
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const { schema } = path ? await ace({ path, what: { do: 'SchemaGet', how: 'schema' } }) : { schema: null }

  const files = {
    enums: resolve(__dirname, root + '.ace/enums.js'),
    jsIndex: resolve(__dirname, root + '.ace/index.js'),
    tsIndex: resolve(__dirname, root + '.ace/index.ts'),
    jsTypedefs: resolve(__dirname, root + '.ace/typedefs.js'),
    tsConfig: resolve(__dirname, root + '.ace/tsconfig.json'),
  }

  await Promise.all([
    writeFile(files.enums, getEnums()), // write enums.js
    writeFile(files.jsTypedefs, getTypedefs(schema)), // write typedefs.js
    writeFile(files.tsConfig, getTsConfig()), // write tsconfig.json
  ])

  console.log('✨ enums ready!\n✨ typedefs ready!')
  await util.promisify(exec)(`tsc -p ${files.tsConfig}`) // write tsc folder AND write .ts type files within folder

  await Promise.all([
    writeFile(files.jsIndex, getJsIndex()), // write index.js
    writeFile(files.tsIndex, getTsIndex()), // write index.ts
  ])
  console.log('✨ types ready!')
}
