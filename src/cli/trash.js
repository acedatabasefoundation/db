import { stdin, stdout } from 'node:process'
import { promptSwitch } from './promptSwitch.js'


/**
 * @returns { Promise<void> }
 */
export async function emptyTrash () {
  let url = ''
  let token = ''

  stdout.write('Please enter url: ')
  stdin.setRawMode(true)
  stdin.setEncoding('utf-8')
  stdin.on('data', onURL)


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
    stdin.removeListener('data', onToken)
    stdout.write('\nLoading...\n')
    stdin.setRawMode(false)
    stdin.pause()

    const rFetch = await fetch(url.trim(), {
      method: 'POST',
      body: JSON.stringify({
        token: token.trim(),
        req: { do: 'EmptyTrash' },
      }),
      headers: {
        'content-type': 'application/json'
      }
    })

    const r = await rFetch.json()

    if (rFetch.status === 200) stdout.write('✨ trash is empty!\n')
    else console.log('error:', r)   
  }


  /** @returns { void } */
  function onControlC () {
    stdout.write('\n')
    stdin.removeListener('data', onURL)
    stdin.removeListener('data', onToken)
    stdin.setRawMode(false)
    stdin.pause()
  }
}
