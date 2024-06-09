import { td } from '#ace'


/**
 * @param { td.AceFnOptions } options
 * @returns { void }
 */
export function log (options) {
  try {
    /** @type { { dir: string, req?: { do: string } | ({ do: string } | string)[] | undefined } } */
    const formatted = {
      dir: options.dir,
    }

    if (Array.isArray(options.req)) {
      formatted.req = []

      for (let i = 0; i < 3; i++) {
        if (options.req[i]) formatted.req.push({ do: options.req[i].do })
      }

      if (options.req[3]) formatted.req.push('...')
    } else if (options.req) {
      formatted.req = { do: options.req.do }
    }

    console.log(formatted, '\n')
  } catch (e) {
    console.log('error', e)
  }
}
