import { td } from '#ace'


/**
 * @param { any[] } array 
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @returns { any[] } 
 */
export function doLimit ($o, array) {
  if ($o.limit) {
    if ($o.limit.skip && $o.limit.count) array = array.slice($o.limit.skip, $o.limit.skip + $o.limit.count)
    else if ($o.limit.skip) array = array.slice($o.limit.skip)
    else if ($o.limit.count) array = array.slice(0, $o.limit.count)
  }

  return array
}
