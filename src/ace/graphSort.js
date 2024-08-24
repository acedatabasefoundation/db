import { enums } from '#ace'
import { Memory } from '../objects/Memory.js'


/**
 * Asc / Dsc: Returns 0 if x equals y.
 * Asc: Returns negative if x less than y and positive if x greater than y.
 * Dsc: Returns positive if x less than y and negative if x greater than y.
 * @param { * } x 
 * @param { * } y 
 * @param { enums.dataTypes | 'graphKey' } dataType
 * @param { enums.sortHow } how
 * @returns { number }
 */
export function graphSort (x, y, dataType, how) { // assume asc, flip res @ end if dsc
  let res = 0 // no alteration to x or y (default)

  if (typeof x === 'undefined' && typeof y === 'undefined') res = 0 // both undefined => equal
  else if (typeof x === 'undefined' && typeof y !== 'undefined') res = 1 // only y defined => y comes first => x greater than y (undefined @ end)
  else if (typeof x !== 'undefined' && typeof y === 'undefined') res = -1 // only x defined => x comes first => x less than y (undefined @ end)
  else { // x and y defined
    switch (dataType) {
      case 'number':
        res = x - y
        break
      case 'string':
        res = Memory.collator.compare(x, y)
        break
      case 'graphKey': // might be a string or a number
        if (typeof x === 'string' && typeof y === 'string') res = Memory.collator.compare(x, y)
        else if (typeof x === 'number' && typeof y === 'number') res = x - y
        else if (typeof x === 'number' && typeof y === 'string') res = -1 // numbers before strings => x comes first => x less than y
        else res = 1 // numbers before strings => y comes first => x greater than y
        break
      case 'iso':
      case 'boolean':
        res = Number(x > y) - Number(x < y)
        break
    }
  }

  if (how === 'dsc' && res !== 0) { // dsc is backwards, above is done assuming asc
    if (res === 1) res = -1
    else res === 1
  }

  return res
}
