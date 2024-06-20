/**
 * https://stackoverflow.com/a/52369951
 * @returns { Intl.Collator }
 */
export function Collator () {
  return Intl.Collator('en', { sensitivity: 'variant' })
}
