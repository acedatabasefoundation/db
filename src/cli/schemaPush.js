import { stdin, stdout } from 'node:process'
import { promptSwitch } from './promptSwitch.js'


/**
 * @returns { Promise<void> }
 */
export async function schemaPush () {
  let version
  let url = ''
  let token = ''

  stdout.write('Please enter url: ')
  stdin.setRawMode(true)
  stdin.setEncoding('utf-8')
  stdin.on('data', onURLData)


  /**
   * @param { Buffer } data
   * @returns { Promise<void> }
   */
  async function onURLData (data) {
    await promptSwitch(data, {
      onControlC,
      onCharacter () {
        url += data
      },
      onBackspace () {
        url = url.slice(0, url.length - 1)
      },
      async onEnter () {
        stdin.removeListener('data', onURLData)
        stdin.on('data', onTokenData)
        stdout.write('\nPlease enter token: ')
      },
    })
  }


  /**
   * @param { Buffer } data
   * @returns { Promise<void> }
   */
  async function onTokenData (data) {
    await promptSwitch(data, {
      onControlC,
      onCharacter () {
        token += data
      },
      onBackspace () {
        token = token.slice(0, token.length - 1)
      },
      async onEnter () {
        token = token.trim()
        stdin.setRawMode(false)
        stdin.removeListener('data', onTokenData)
        stdin.on('data', onVersionEnter)
        stdout.write('\nPlease enter version: ')
      },
    })
  }


  /**
   * @param { Buffer } data
   * @returns { Promise<void> }
   */
  async function onVersionEnter (data) {
    version = Number(data.toString().trim())
    stdin.removeListener('data', onVersionEnter)
    stdout.write('Loading...\n')
    stdin.pause()

    const rFetch = await fetch(url.trim(), {
      method: 'POST',
      body: JSON.stringify({
        token,
        req: {
          do: 'SchemaPush',
          how: version
        },
      }),
      headers: {
        'content-type': 'application/json'
      }
    })

    const r = await rFetch.json()

    if (rFetch.status === 200) stdout.write('✨ push succesful!\n')
    else console.log('error:', r)  
  }


  /** @returns { void } */
  function onControlC () {
    stdout.write('\n')
    stdin.removeListener('data', onURLData)
    stdin.removeListener('data', onTokenData)
    stdin.removeListener('data', onVersionEnter)
    stdin.setRawMode(false)
    stdin.pause()
  }
}
