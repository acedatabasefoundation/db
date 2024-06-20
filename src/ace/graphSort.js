import { enums } from '#ace'


/**
 * @param {*} x 
 * @param {*} y 
 * @param { Intl.Collator } collator
 * @param { enums.dataTypes | 'graphKey' } dataType
 * @param { enums.sortHow } how
 * @returns { number }
 */
export function graphSort (x, y, collator, dataType, how) { // order ascending
  let res = 0 // no alteration to x or y (default)

  if (typeof x === 'undefined' && typeof y === 'undefined') res = 0 // both undefined => equal
  else if (typeof x === 'undefined' && typeof y !== 'undefined') res = 1 // only x undefined => y comes first (undefined @ end)
  else if (typeof x !== 'undefined' && typeof y === 'undefined') res = -1 // only y undefined => x comes first (undefined @ end)
  else { // x and y defined
    switch (dataType) {
      case 'string':
        res = collator.compare(x, y)
        break
      case 'iso':
      case 'number':
      case 'boolean':
        res = Number(x > y) - Number(x < y)
        break
      case 'graphKey': // might be a string or a number
        if (typeof x === 'string' && typeof y === 'string') res = collator.compare(x, y)
        else if (typeof x === 'number' && typeof y === 'number') res = Number(x > y) - Number(x < y)
        else if (typeof x === 'string' && typeof y === 'number') res = 1 // x comes first (string come before number)
        else res = -1 // y comes first (string come before numbers)
        break
    }
  }

  if (how === 'dsc' && res !== 0) { // dsc is backwards, above is done assuming asc
    if (res === 1) res = -1
    else res === 1
  }

  return res
}
