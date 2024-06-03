import { td } from '#ace'


/**
 * @param { td.AceFnOptions } options
 * @returns { void }
 */
export function log (options) {
  try {
    /** @type { { path: string, what?: { do: string } | ({ do: string } | string)[] | undefined } } */
    const formatted = {
      path: options.path,
    }

    if (Array.isArray(options.what)) {
      formatted.what = []

      for (let i = 0; i < 3; i++) {
        if (options.what[i]) formatted.what.push({ do: options.what[i].do })
      }

      if (options.what[3]) formatted.what.push('...')
    } else if (options.what) {
      formatted.what = { do: options.what.do }
    }

    console.log(formatted, '\n')
  } catch (e) {
    console.log('error', e)
  }
}
