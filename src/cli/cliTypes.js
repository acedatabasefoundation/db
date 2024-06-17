import util from 'node:util'
import { fileURLToPath } from 'node:url'
import { getEnums } from './getEnums.js'
import { exec } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { stdin, stdout } from 'node:process'
import { getTypedefs } from './getTypedefs.js'
import { getTsConfig } from './getTsConfig.js'
import { promptSwitch } from './promptSwitch.js'
import { getJsIndex, getTsIndex } from './getIndex.js'
import { dirname, resolve as pathResolve } from 'node:path'


/**
 * @returns { Promise<void> }
 */
export async function cliTypes () {
  const root = '../../'
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const { schema } = await getSchema()

  const files = {
    enums: pathResolve(__dirname, root + '.ace/enums.js'),
    jsIndex: pathResolve(__dirname, root + '.ace/index.js'),
    tsIndex: pathResolve(__dirname, root + '.ace/index.ts'),
    jsTypedefs: pathResolve(__dirname, root + '.ace/typedefs.js'),
    tsConfig: pathResolve(__dirname, root + '.ace/tsconfig.json'),
  }

  await Promise.all([
    writeFile(files.enums, getEnums()), // write enums.js
    writeFile(files.jsTypedefs, getTypedefs(schema)), // write typedefs.js
    writeFile(files.tsConfig, getTsConfig()), // write tsconfig.json
  ])

  stdout.write('✨ enums ready!\n✨ typedefs ready!\n')
  await util.promisify(exec)(`tsc -p ${files.tsConfig}`) // write tsc folder AND write .ts type files within folder

  await Promise.all([
    writeFile(files.jsIndex, getJsIndex()), // write index.js
    writeFile(files.tsIndex, getTsIndex()), // write index.ts
  ])
  stdout.write('✨ types ready!\n')
}


function getSchema () {
  return new Promise((resolve, reject) => {
    let url = ''
    let token = ''

    stdout.write('Schema specific types (y/n): ')
    stdin.setEncoding('utf-8')
    stdin.on('data', onRadio)

    /**
     * @param { Buffer } data
     * @returns { void }
     */
    function onRadio (data) {
      switch (data.toString().trim()) {
        case 'y':
          stdin.removeListener('data', onRadio)
          stdin.on('data', onURL)
          stdout.write('Please enter url: ')
          stdin.setRawMode(true)
          break
        case 'n':
          stdin.removeListener('data', onRadio)
          stdin.pause()
          resolve({ schema: null })
          break
        default:
          stdin.removeListener('data', onRadio)
          stdin.pause()
          reject('Please enter the letter "y" or "n"')
          break
      }
    }


    /**
     * @param { Buffer } data
     * @returns { Promise<void> }
     */
    async function onURL (data) {
      await promptSwitch(data, {
        onControlC,
        onCharacter () {
          url += data
        },
        onBackspace () {
          url = url.slice(0, url.length - 1)
        },
        async onEnter () {
          stdin.removeListener('data', onURL)
          stdin.on('data', onToken)
          stdout.write('\nPlease enter token: ')
        },
      })
    }


    /**
     * @param { Buffer } data
     * @returns { Promise<void> }
     */
    async function onToken (data) {
      await promptSwitch(data, {
        onControlC,
        onEnter: onTokenEnter,
        onCharacter () {
          token += data
        },
        onBackspace () {
          token = token.slice(0, token.length - 1)
        },
      })
    }


    /** @returns { Promise<void> } */
    async function onTokenEnter () {
      stdout.write('\nLoading...\n')
      stdin.removeListener('data', onToken)
      stdin.setRawMode(false)
      stdin.pause()

      const rFetch = await fetch(url.trim(), {
        method: 'POST',
        body: JSON.stringify({
          token: token.trim(),
          req: { do: 'SchemaGet', how: 'schema' },
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const r = await rFetch.json()

      if (rFetch.status === 200) resolve({ schema: r.schema })
      else reject(r)
    }


    /** @returns { void } */
    function onControlC () {
      stdout.write('\n')
      stdin.removeListener('data', onToken)
      stdin.removeListener('data', onURL)
      stdin.setRawMode(false)
      stdin.pause()
    }
  })
}
