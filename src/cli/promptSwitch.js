import { td } from '#ace'


/**
 * @param { Buffer } data
 * @param { td.AceCLIPromptSwitchCallbacks } callbacks
 * @returns { Promise<void> }
 */
export async function promptSwitch (data, callbacks) {
  switch (data.toString()) { // https://docs.yellowbrick.com/6.8.1/ybd_sqlref/nonprintchar_escape_sequences.html + https://stackoverflow.com/a/75030219
    case '\r':
    case '\n':
    case '\x04':
      await callbacks.onEnter(data)
      break
    case '\u0003':
      callbacks.onControlC(data)
      break
    case '\x08':
    case '\x7f':
      callbacks.onBackspace(data)
      break
    default:
      callbacks.onCharacter(data)
      break
  }
}
