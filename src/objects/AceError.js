import { td } from '#ace'


/**
 * @param { string } id - Short enum about the error. Should not change from occurrence to occurrence of the error
 * @param { string } detail - Human-readable explanation specific to this occurrence of the error
 * @param { { [errorItemKey: string]: any } } errorData - Additional members that extend the error details object with specifics about that error
 * @returns { td.AceError }
 */
export function AceError (id, detail, errorData) {
  return {
    id,
    detail,
    ...errorData
  }
}


/**
 * @param { string } name 
 * @param { string } option1 
 * @param { string } option2 
 * @returns { td.AceError }
 */
export function CLIFalsyError (name, option1, option2) {
  return AceError(`cli__${ name }-falsy`, `Ace CLI is throwing an error b/c the option ${ option1 } which may be also specified like this ${ option2 } is falsy`, { [ name ]: '' })
}
