import { td, enums } from '#ace'
import { queryWhere } from './queryWhere.js'
import { getDerivedValue } from './getDerivedValue.js'
import { getRelationshipNode } from './getRelationshipNode.js'
import { DEFAULT_QUERY_OPTIONS_FLOW, POST_QUERY_OPTIONS_FLOW } from '../../util/variables.js'


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @param { boolean } isUsingSortIndex 
 * @param { td.AceFnCryptoJWKs } jwks 
 * @returns { Promise<void> }
 */
export async function doQueryOptions (detailedResValueSection, res, isUsingSortIndex, jwks) {
  if (detailedResValueSection.resValue?.$o) {
    const $o = detailedResValueSection.resValue.$o

    /** @type { boolean } Set to true when ...AsRes is used */
    let hasValueAsResponse = false

    /** @type { Set<string> } If we have completed an option put it in done */
    const doneOptions = new Set()

    if ($o.flow) { // do in requested flow order
      for (const option of $o.flow) {
        hasValueAsResponse = await doOption(option, hasValueAsResponse, doneOptions, detailedResValueSection, $o, res, isUsingSortIndex, jwks)
      }
    }

    for (const option of DEFAULT_QUERY_OPTIONS_FLOW) { // do in default flow order
      hasValueAsResponse = await doOption(option, hasValueAsResponse, doneOptions, detailedResValueSection, $o, res, isUsingSortIndex, jwks)
    }

    for (const option of POST_QUERY_OPTIONS_FLOW) { // do post flow order
      hasValueAsResponse = await doOption(option, hasValueAsResponse, doneOptions, detailedResValueSection, $o, res, isUsingSortIndex, jwks)
    }

    if (hasValueAsResponse || detailedResValueSection.schemaHas === 'one' || $o.limit?.count === 1 || $o.findById || $o.findBy_Id || $o.findByUnique || $o.findByOr || $o.findByAnd || $o.findByDefined || $o.findByUndefined || $o.findByPropValue || $o.findByPropProp || $o.findByPropRes) {
      res.now[detailedResValueSection.resKey] = typeof res.now[detailedResValueSection.resKey]?.[0] === 'undefined' ? null : res.now[detailedResValueSection.resKey][0]
      res.original[detailedResValueSection.resKey] = typeof res.original[detailedResValueSection.resKey]?.[0] === 'undefined' ? null : res.original[detailedResValueSection.resKey][0]
    }
  }
}



/**
 * @param { string } option
 * @param { boolean } hasValueAsResponse
 * @param { Set<string> } doneOptions
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { boolean } isUsingSortIndex 
 * @param { td.AceFnCryptoJWKs } jwks 
 * @returns { Promise<boolean> }
 */
async function doOption (option, hasValueAsResponse, doneOptions, detailedResValueSection, $o, res, isUsingSortIndex, jwks) {
  if (!hasValueAsResponse && !doneOptions.has(option) && $o[/** @type { keyof td.AceQueryRequestItemNodeOptions } */(option)]) {
    switch (option) {
      case enums.queryOptions.findByOr:
      case enums.queryOptions.findByAnd:
      case enums.queryOptions.findByDefined:
      case enums.queryOptions.findByUndefined:
      case enums.queryOptions.findByPropValue:
      case enums.queryOptions.findByPropProp:
      case enums.queryOptions.findByPropRes:
      case enums.queryOptions.filterByOr:
      case enums.queryOptions.filterByAnd:
      case enums.queryOptions.filterByDefined:
      case enums.queryOptions.filterByUndefined:
      case enums.queryOptions.filterByPropValue:
      case enums.queryOptions.filterByPropProp:
      case enums.queryOptions.filterByPropRes:
        await queryWhere(detailedResValueSection, res, option, jwks)
        break

      case enums.queryOptions.limit:
        doLimit($o, res, detailedResValueSection.resKey)
        break

      case enums.queryOptions.sort:
        doSort($o, res, detailedResValueSection.resKey, isUsingSortIndex)
        break

      case enums.queryOptions.newProps:
        doNewProps($o, res, detailedResValueSection)
        break

      case enums.queryOptions.sumAsProp:
        doSumAsProp($o, res, detailedResValueSection.resKey, detailedResValueSection.resHide)
        break

      case enums.queryOptions.avgAsProp:
        doAvgAsProp($o, res, detailedResValueSection.resKey, detailedResValueSection.resHide)
        break

      case enums.postQueryOptions.avgAsRes:
        hasValueAsResponse = true
        doAvgAsRes($o, res, detailedResValueSection.resKey)
        break

      case enums.queryOptions.minAmtAsProp:
        doMinAmtAsProp($o, res, detailedResValueSection.resKey, detailedResValueSection.resHide)
        break

      case enums.postQueryOptions.minAmtAsRes:
        hasValueAsResponse = true
        doMinAmtAsRes($o, res, detailedResValueSection.resKey)
        break

      case enums.postQueryOptions.minNodeAsRes:
        hasValueAsResponse = true
        doMinNodeAsRes($o, res, detailedResValueSection.resKey)
        break

      case enums.queryOptions.maxAmtAsProp:
        doMaxAmtAsProp($o, res, detailedResValueSection.resKey, detailedResValueSection.resHide)
        break

      case enums.postQueryOptions.maxAmtAsRes:
        hasValueAsResponse = true
        doMaxAmtAsRes($o, res, detailedResValueSection.resKey)
        break

      case enums.postQueryOptions.maxNodeAsRes:
        hasValueAsResponse = true
        doMaxNodeAsRes($o, res, detailedResValueSection.resKey)
        break

      case enums.queryOptions.countAsProp:
        doCountAsProp($o, res, detailedResValueSection.resKey, detailedResValueSection.resHide)
        break

      case enums.queryOptions.countAdjToRes:
        doCountAdjToRes($o, res, detailedResValueSection.resKey)
        break

      case enums.postQueryOptions.countAsRes:
        hasValueAsResponse = true
        doCountAsRes($o, res, detailedResValueSection.resKey)
        break

      case enums.postQueryOptions.propAsRes:
        hasValueAsResponse = true
        doPropAsRes($o, res, detailedResValueSection)
        break

      case enums.postQueryOptions.sumAsRes:
        hasValueAsResponse = true
        doSumAsRes($o, res, detailedResValueSection.resKey, detailedResValueSection.resHide)
        break

      case enums.queryOptions.propAdjToRes:
        doPropAdjacentToRes($o, res, detailedResValueSection)
        break
    }
  }

  doneOptions.add(option)

  return hasValueAsResponse
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @returns { void }
 */
function doLimit ($o, res, resKey) {
  if ($o.limit) {
    if ($o.limit.skip && $o.limit.count) {
      res.now[resKey] = res.now[resKey].slice($o.limit.skip, $o.limit.skip + $o.limit.count)
      res.original[resKey] = res.original[resKey].slice($o.limit.skip, $o.limit.skip + $o.limit.count)
    } else if ($o.limit.skip) {
      res.now[resKey] = res.now[resKey].slice($o.limit.skip)
      res.original[resKey] = res.original[resKey].slice($o.limit.skip)
    } else if ($o.limit.count) {
      res.now[resKey] = res.now[resKey].slice(0, $o.limit.count)
      res.original[resKey] = res.original[resKey].slice(0, $o.limit.count)
    }
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @param { boolean } isUsingSortIndex 
 * @returns { void }
 */
function doSort ($o, res, resKey, isUsingSortIndex) {
  if (!isUsingSortIndex && $o.sort) { // IF not using a sorted index array => sort items
    const combined = []
    const sort = $o.sort

    for (let i = 0; i < res.original[resKey].length; i++) {
      combined.push({
        now: res.now[resKey][i],
        original: res.original[resKey][i],
      })
    }

    combined.sort((a, b) => {
      let rSort = 0
      let x = a.now[sort.prop]
      let y = b.now[sort.prop]

      if (x < y) rSort = (sort.how === enums.sortHow.dsc) ? 1 : -1
      if (x > y) rSort = (sort.how === enums.sortHow.dsc) ? -1 : 1

      return rSort
    })

    res.now[resKey] = combined.map((value) => value.now)
    res.original[resKey] = combined.map((value) => value.original)
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @returns { void }
 */
function doNewProps ($o, res, detailedResValueSection) {
  if ($o.newProps) {
    const newPropKeys = Object.keys($o.newProps)

    if (newPropKeys.length) {
      for (let i = 0; i < res.original[detailedResValueSection.resKey].length; i++) { // looping graph nodes
        for (const prop of newPropKeys) {
          const derivedGroup = /** @type { td.AceQueryDerivedGroup } */ ($o.newProps[prop])
          const derivedValue = getDerivedValue(detailedResValueSection, res.original[detailedResValueSection.resKey][i], derivedGroup)

          res.original[detailedResValueSection.resKey][i][prop] = derivedValue
          if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[detailedResValueSection.resKey][i][prop] = derivedValue
        }
      }
    }
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @param { td.AceQueryResHide } resHide
 * @returns { void }
 */
function doSumAsProp ($o, res, resKey, resHide) {
  if ($o.sumAsProp) {
    let sum = 0
    const sumAsProp = $o.sumAsProp

    for (let arrayItem of res.original[resKey]) {
      sum += arrayItem[sumAsProp.computeProp]
    }

    for (let i = 0; i < res.original[resKey].length; i++) {
      res.original[resKey][i][sumAsProp.newProp] = sum
      if (!resHide || !resHide.has(resKey)) res.now[resKey][i][sumAsProp.newProp] = sum
    }
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @param { td.AceQueryResHide } resHide
 * @returns { void }
 */
function doSumAsRes ($o, res, resKey, resHide) {
  if ($o.sumAsRes) {
    let sum = 0

    for (let arrayItem of res.original[resKey]) {
      sum += arrayItem[$o.sumAsRes]
    }

    res.original[resKey] = [sum]
    if (!resHide || !resHide.has(resKey)) res.now[resKey] = [ sum ]
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @param { td.AceQueryResHide } resHide
 * @returns { void }
 */
function doAvgAsProp ($o, res, resKey, resHide) {
  if ($o.avgAsProp) {
    let sum = 0

    const original = res.original[resKey]

    for (let arrayItem of original) {
      sum += arrayItem[$o.avgAsProp.computeProp]
    }

    const average = original.length ? sum / original.length : 0

    for (let i = 0; i < original.length; i++) {
      original[i][$o.avgAsProp.newProp] = average
      if (!resHide || !resHide.has(resKey)) res.now[resKey][i][$o.avgAsProp.newProp] = average
    }
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @returns { void }
 */
function doAvgAsRes ($o, res, resKey) {
  if ($o.avgAsRes) {
    let sum = 0

    const original = res.original[resKey]

    for (let arrayItem of original) {
      sum += arrayItem[$o.avgAsRes]
    }

    const average = original.length ? sum / original.length : 0

    res.now[resKey] = [ average ]
    res.original[resKey] = [ average ]
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @param { td.AceQueryResHide } resHide
 * @returns { void }
 */
function doMinAmtAsProp ($o, res, resKey, resHide) {
  if ($o.minAmtAsProp) {
    let amount = 0

    const minAmtAsProp = $o.minAmtAsProp
    const original = res.original[resKey]

    for (let arrayItem of original) {
      if (!amount || arrayItem[minAmtAsProp.computeProp] < amount) amount = arrayItem[minAmtAsProp.computeProp]
    }

    for (let i = 0; i < original.length; i++) {
      original[i][minAmtAsProp.newProp] = amount
      if (!resHide || !resHide.has(resKey)) res.now[resKey][i][minAmtAsProp.newProp] = amount
    }
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @returns { void }
 */
function doMinAmtAsRes ($o, res, resKey) {
  if ($o.minAmtAsRes) {
    let amount = 0

    const original = res.original[resKey]

    for (let arrayItem of original) {
      if (!amount || arrayItem[$o.minAmtAsRes] < amount) amount = arrayItem[$o.minAmtAsRes]
    }

    res.now[resKey] = [amount]
    res.original[resKey] = [amount]
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @returns { void }
 */
function doMinNodeAsRes ($o, res, resKey) {
  if ($o.minNodeAsRes) {
    let node = null
    let amount = 0

    const original = res.original[resKey]

    for (let i = 0; i < original.length; i++) {
      if (!node || original[i][$o.minNodeAsRes] < amount) {
        amount = original[i][$o.minNodeAsRes]
        node = res.now[resKey][i]
      }
    }

    res.now[resKey] = [ node ]
    res.original[resKey] = [ node ]
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @returns { void }
 */
function doMaxNodeAsRes ($o, res, resKey) {
  if ($o.maxNodeAsRes) {
    let node = null
    let amount = 0

    const original = res.original[resKey]

    for (let i = 0; i < original.length; i++) {
      if (!node || original[i][$o.maxNodeAsRes] > amount) {
        amount = original[i][$o.maxNodeAsRes]
        node = res.now[resKey][i]
      }
    }

    res.now[resKey] = [ node ]
    res.original[resKey] = [ node] 
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @param { td.AceQueryResHide } resHide
 * @returns { void }
 */
function doMaxAmtAsProp ($o, res, resKey, resHide) {
  if ($o.maxAmtAsProp) {
    let amount = 0

    const original = res.original[resKey]

    for (let arrayItem of original) {
      if (!amount || arrayItem[$o.maxAmtAsProp.computeProp] > amount) amount = arrayItem[$o.maxAmtAsProp.computeProp]
    }

    for (let i = 0; i < original.length; i++) {
      original[i][$o.maxAmtAsProp.newProp] = amount
      if (!resHide || !resHide.has(resKey)) res.now[resKey][i][$o.maxAmtAsProp.newProp] = amount
    }
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @returns { void }
 */
function doMaxAmtAsRes ($o, res, resKey) {
  if ($o.maxAmtAsRes) {
    let amount = 0

    const original = res.original[resKey]

    for (let arrayItem of original) {
      if (!amount || arrayItem[$o.maxAmtAsRes] > amount) amount = arrayItem[$o.maxAmtAsRes]
    }

    res.now[resKey] = [amount]
    res.original[resKey] = [amount]
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @param { td.AceQueryResHide } resHide
 * @returns { void }
 */
function doCountAsProp ($o, res, resKey, resHide) {
  if ($o.countAsProp) {
    const count = res.original[resKey].length

    for (let i = 0; i < count; i++) {
      res.original[resKey][i][$o.countAsProp] = count
      if (!resHide || !resHide.has($o.countAsProp)) res.now[resKey][i][$o.countAsProp] = count
    }
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @returns { void }
 */
function doCountAdjToRes ($o, res, resKey) {
  if ($o.countAdjToRes) {
    const count = res.original[resKey].length

    res.original[$o.countAdjToRes] = count
    res.now[$o.countAdjToRes] = count
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @returns { void }
 */
function doCountAsRes ($o, res, resKey) {
  if ($o.countAsRes) {
    const count = res.original[resKey].length

    res.now[resKey] = [count]
    res.original[resKey] = [count]
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @returns { void }
 */
function doPropAsRes ($o, res, detailedResValueSection) {
  if ($o.propAsRes) {
    let value
    let original = res.original[detailedResValueSection.resKey]

    if (!$o.propAsRes.relationships?.length) value = original?.[0]?.[$o.propAsRes.prop]
    else {
      const rRelationshipNode = getRelationshipNode(detailedResValueSection, original[0], $o.propAsRes.relationships)
      value = rRelationshipNode?.node?.[$o.propAsRes.prop]
    }

    if (typeof value !== 'undefined') {
      res.now[detailedResValueSection.resKey] = [ value ]
      original = [ value ]
    }
  }
}


/**
 * @param { td.AceQueryRequestItemNodeOptions } $o 
 * @param { td.AceFnFullResponse } res 
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @returns { void }
 */
function doPropAdjacentToRes ($o, res, detailedResValueSection) {
  if ($o.propAdjToRes) {
    let value
    let original = res.original[detailedResValueSection.resKey]

    if (!$o.propAdjToRes.relationships?.length) value = original?.[0]?.[$o.propAdjToRes.sourceProp]
    else {
      const rRelationshipNode = getRelationshipNode(detailedResValueSection, original[0], $o.propAdjToRes.relationships)
      value = rRelationshipNode?.node?.[$o.propAdjToRes.sourceProp]
    }

    if (typeof value !== 'undefined') {
      res.now[$o.propAdjToRes.adjacentProp] = value
      res.original[$o.propAdjToRes.adjacentProp] = value
    }
  }
}
