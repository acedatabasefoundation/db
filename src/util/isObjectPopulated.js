/**
 * Is this an object with props in it?!
 * @param {*} obj 
 * @returns { boolean }
 */
export function isObjectPopulated (obj) {
  let is = false

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) is = false
  else {
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        is = true
        break
      }
    }
  }

  return is
}
