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
    /** @type { boolean } Set to true when ...AsRes is used */
    let hasValueAsResponse = false

    /** @type { Set<string> } If we have completed an option put it in done */
    const doneOptions = new Set()

    if (detailedResValueSection.resValue?.$o.flow) { // do in requested flow order
      for (const option of detailedResValueSection.resValue?.$o.flow) {
        hasValueAsResponse = await doOption(option, hasValueAsResponse, doneOptions, detailedResValueSection, res, isUsingSortIndex, jwks)
      }
    }

    for (const option of DEFAULT_QUERY_OPTIONS_FLOW) { // do in default flow order
      hasValueAsResponse = await doOption(option, hasValueAsResponse, doneOptions, detailedResValueSection, res, isUsingSortIndex, jwks)
    }

    for (const option of POST_QUERY_OPTIONS_FLOW) { // do post flow order
      hasValueAsResponse = await doOption(option, hasValueAsResponse, doneOptions, detailedResValueSection, res, isUsingSortIndex, jwks)
    }

    if (hasValueAsResponse || detailedResValueSection.schemaHas === 'one' || detailedResValueSection.resValue?.$o?.limit?.count === 1 || detailedResValueSection.resValue?.$o?.findById || detailedResValueSection.resValue?.$o?.findBy_Id || detailedResValueSection.resValue?.$o?.findByUnique || detailedResValueSection.resValue?.$o?.findByOr || detailedResValueSection.resValue?.$o?.findByAnd || detailedResValueSection.resValue?.$o?.findByDefined || detailedResValueSection.resValue?.$o?.findByUndefined || detailedResValueSection.resValue?.$o?.findByPropValue || detailedResValueSection.resValue?.$o?.findByPropProp || detailedResValueSection.resValue?.$o?.findByPropRes) {
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
 * @param { td.AceFnFullResponse } res 
 * @param { boolean } isUsingSortIndex 
 * @param { td.AceFnCryptoJWKs } jwks 
 * @returns { Promise<boolean> }
 */
async function doOption (option, hasValueAsResponse, doneOptions, detailedResValueSection, res, isUsingSortIndex, jwks) {
  if (!hasValueAsResponse && !doneOptions.has(option) && detailedResValueSection.resValue?.$o?.[/** @type { keyof td.AceQueryRequestItemNodeOptions } */(option)]) {
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
        doLimit(detailedResValueSection, res)
        break

      case enums.queryOptions.sort:
        doSort(detailedResValueSection, res, isUsingSortIndex)
        break

      case enums.queryOptions.newProps:
        doNewProps(detailedResValueSection, res)
        break

      case enums.queryOptions.sumAsProp:
        doSumAsProp(detailedResValueSection, res)
        break

      case enums.queryOptions.avgAsProp:
        doAvgAsProp(detailedResValueSection, res)
        break

      case enums.postQueryOptions.avgAsRes:
        hasValueAsResponse = true
        doAvgAsRes(detailedResValueSection, res)
        break

      case enums.queryOptions.minAmtAsProp:
        doMinAmtAsProp(detailedResValueSection, res)
        break

      case enums.postQueryOptions.minAmtAsRes:
        hasValueAsResponse = true
        doMinAmtAsRes(detailedResValueSection, res)
        break

      case enums.postQueryOptions.minNodeAsRes:
        hasValueAsResponse = true
        doMinNodeAsRes(detailedResValueSection, res)
        break

      case enums.queryOptions.maxAmtAsProp:
        doMaxAmtAsProp(detailedResValueSection, res)
        break

      case enums.postQueryOptions.maxAmtAsRes:
        hasValueAsResponse = true
        doMaxAmtAsRes(detailedResValueSection, res)
        break

      case enums.postQueryOptions.maxNodeAsRes:
        hasValueAsResponse = true
        doMaxNodeAsRes(detailedResValueSection, res)
        break

      case enums.queryOptions.countAsProp:
        doCountAsProp(detailedResValueSection, res)
        break

      case enums.postQueryOptions.countAsRes:
        hasValueAsResponse = true
        doCountAsRes(detailedResValueSection, res)
        break

      case enums.postQueryOptions.propAsRes:
        hasValueAsResponse = true
        doPropAsRes(detailedResValueSection, res)
        break

      case enums.postQueryOptions.sumAsRes:
        hasValueAsResponse = true
        doSumAsRes(detailedResValueSection, res)
        break

      case enums.queryOptions.propAdjToRes:
        doPropAdjacentToRes(detailedResValueSection, res)
        break
    }
  }

  doneOptions.add(option)

  return hasValueAsResponse
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doLimit (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.limit) {
    const limit = detailedResValueSection.resValue?.$o.limit

    if (limit.skip && limit.count) {
      res.now[detailedResValueSection.resKey] = res.now[detailedResValueSection.resKey].slice(limit.skip, limit.skip + limit.count)
      res.original[detailedResValueSection.resKey] = res.original[detailedResValueSection.resKey].slice(limit.skip, limit.skip + limit.count)
    } else if (limit.skip) {
      res.now[detailedResValueSection.resKey] = res.now[detailedResValueSection.resKey].slice(limit.skip)
      res.original[detailedResValueSection.resKey] = res.original[detailedResValueSection.resKey].slice(limit.skip)
    } else if (limit.count) {
      res.now[detailedResValueSection.resKey] = res.now[detailedResValueSection.resKey].slice(0, limit.count)
      res.original[detailedResValueSection.resKey] = res.original[detailedResValueSection.resKey].slice(0, limit.count)
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @param { boolean } isUsingSortIndex 
 * @returns { void }
 */
function doSort (detailedResValueSection, res, isUsingSortIndex) {
  if (!isUsingSortIndex && detailedResValueSection.resValue?.$o?.sort) { // IF not using a sorted index array => sort items
    const combined = []
    const sort = detailedResValueSection.resValue?.$o.sort

    for (let i = 0; i < res.original[detailedResValueSection.resKey].length; i++) {
      combined.push({
        now: res.now[detailedResValueSection.resKey][i],
        original: res.original[detailedResValueSection.resKey][i],
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

    res.now[detailedResValueSection.resKey] = combined.map((value) => value.now)
    res.original[detailedResValueSection.resKey] = combined.map((value) => value.original)
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doNewProps (detailedResValueSection, res) {
  const newPropKeys = Object.keys(detailedResValueSection.resValue?.$o?.newProps || {})

  if (newPropKeys.length) {
    for (let i = 0; i < res.original[detailedResValueSection.resKey].length; i++) { // looping graph nodes
      for (const prop of newPropKeys) {
        const derivedGroup = /** @type { td.AceQueryDerivedGroup } */ (detailedResValueSection.resValue?.$o?.newProps?.[prop])
        const derivedValue = getDerivedValue(detailedResValueSection, res.original[detailedResValueSection.resKey][i], derivedGroup)

        res.original[detailedResValueSection.resKey][i][prop] = derivedValue
        if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[detailedResValueSection.resKey][i][prop] = derivedValue
      }
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doSumAsProp (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.sumAsProp) {
    let sum = 0
    const sumAsProp = detailedResValueSection.resValue?.$o.sumAsProp

    for (let arrayItem of res.original[detailedResValueSection.resKey]) {
      sum += arrayItem[sumAsProp.computeProp]
    }

    for (let i = 0; i < res.original[detailedResValueSection.resKey].length; i++) {
      res.original[detailedResValueSection.resKey][i][sumAsProp.newProp] = sum
      if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[detailedResValueSection.resKey][i][sumAsProp.newProp] = sum
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doSumAsRes (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.sumAsRes) {
    let sum = 0
    const sumAsRes = detailedResValueSection.resValue?.$o.sumAsRes

    for (let arrayItem of res.original[detailedResValueSection.resKey]) {
      sum += arrayItem[sumAsRes]
    }

    res.original[detailedResValueSection.resKey] = [sum]
    if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[detailedResValueSection.resKey] = [ sum ]
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doAvgAsProp (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.avgAsProp) {
    let sum = 0

    const avgAsProp = detailedResValueSection.resValue?.$o.avgAsProp
    const original = res.original[detailedResValueSection.resKey]

    for (let arrayItem of original) {
      sum += arrayItem[avgAsProp.computeProp]
    }

    const average = original.length ? sum / original.length : 0

    for (let i = 0; i < original.length; i++) {
      original[i][avgAsProp.newProp] = average
      if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[detailedResValueSection.resKey][i][avgAsProp.newProp] = average
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doAvgAsRes (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.avgAsRes) {
    let sum = 0

    const avgAsRes = detailedResValueSection.resValue?.$o.avgAsRes
    const original = res.original[detailedResValueSection.resKey]

    for (let arrayItem of original) {
      sum += arrayItem[avgAsRes]
    }

    const average = original.length ? sum / original.length : 0

    res.now[detailedResValueSection.resKey] = [average]
    res.original[detailedResValueSection.resKey] = [average]
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doMinAmtAsProp (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.minAmtAsProp) {
    let amount = 0

    const minAmtAsProp = detailedResValueSection.resValue?.$o.minAmtAsProp
    const original = res.original[detailedResValueSection.resKey]

    for (let arrayItem of original) {
      if (!amount || arrayItem[minAmtAsProp.computeProp] < amount) amount = arrayItem[minAmtAsProp.computeProp]
    }

    for (let i = 0; i < original.length; i++) {
      original[i][minAmtAsProp.newProp] = amount
      if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[detailedResValueSection.resKey][i][minAmtAsProp.newProp] = amount
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doMinAmtAsRes (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.minAmtAsRes) {
    let amount = 0

    const minAmtAsRes = detailedResValueSection.resValue?.$o.minAmtAsRes
    const original = res.original[detailedResValueSection.resKey]

    for (let arrayItem of original) {
      if (!amount || arrayItem[minAmtAsRes] < amount) amount = arrayItem[minAmtAsRes]
    }

    res.now[detailedResValueSection.resKey] = [amount]
    res.original[detailedResValueSection.resKey] = [amount]
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doMinNodeAsRes (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.minNodeAsRes) {
    let node = null
    let amount = 0

    const minNodeAsRes = detailedResValueSection.resValue?.$o.minNodeAsRes
    const original = res.original[detailedResValueSection.resKey]

    for (let i = 0; i < original.length; i++) {
      if (!node || original[i][minNodeAsRes] < amount) {
        amount = original[i][minNodeAsRes]
        node = res.now[detailedResValueSection.resKey][i]
      }
    }

    res.now[detailedResValueSection.resKey] = [node]
    res.original[detailedResValueSection.resKey] = [node]
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doMaxNodeAsRes (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.maxNodeAsRes) {
    let node = null
    let amount = 0

    const maxNodeAsRes = detailedResValueSection.resValue?.$o.maxNodeAsRes
    const original = res.original[detailedResValueSection.resKey]

    for (let i = 0; i < original.length; i++) {
      if (!node || original[i][maxNodeAsRes] > amount) {
        amount = original[i][maxNodeAsRes]
        node = res.now[detailedResValueSection.resKey][i]
      }
    }

    res.now[detailedResValueSection.resKey] = [node]
    res.original[detailedResValueSection.resKey] = [node]
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doMaxAmtAsProp (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.maxAmtAsProp) {
    let amount = 0

    const maxAmtAsProp = detailedResValueSection.resValue?.$o?.maxAmtAsProp
    const original = res.original[detailedResValueSection.resKey]

    for (let arrayItem of original) {
      if (!amount || arrayItem[maxAmtAsProp.computeProp] > amount) amount = arrayItem[maxAmtAsProp.computeProp]
    }

    for (let i = 0; i < original.length; i++) {
      original[i][maxAmtAsProp.newProp] = amount
      if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[detailedResValueSection.resKey][i][maxAmtAsProp.newProp] = amount
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doMaxAmtAsRes (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.maxAmtAsRes) {
    let amount = 0

    const maxAmtAsRes = detailedResValueSection.resValue?.$o.maxAmtAsRes
    const original = res.original[detailedResValueSection.resKey]

    for (let arrayItem of original) {
      if (!amount || arrayItem[maxAmtAsRes] > amount) amount = arrayItem[maxAmtAsRes]
    }

    res.now[detailedResValueSection.resKey] = [amount]
    res.original[detailedResValueSection.resKey] = [amount]
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doCountAsProp (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.countAsProp) {
    const count = getCount(detailedResValueSection, res)
    const countAsProp = detailedResValueSection.resValue?.$o.countAsProp

    for (let i = 0; i < count; i++) {
      res.original[detailedResValueSection.resKey][i][countAsProp] = count
      if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(countAsProp)) res.now[detailedResValueSection.resKey][i][countAsProp] = count
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doCountAsRes (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.countAsRes) {
    const count = getCount(detailedResValueSection, res)

    res.now[detailedResValueSection.resKey] = [count]
    res.original[detailedResValueSection.resKey] = [count]
  }
}



/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { number }
 */
function getCount (detailedResValueSection, res) {
  return res.original[detailedResValueSection.resKey].length
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doPropAsRes (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.propAsRes) {
    let value
    let original = res.original[detailedResValueSection.resKey]

    const propAsRes = detailedResValueSection.resValue?.$o.propAsRes

    if (!propAsRes.relationships?.length) value = original?.[0]?.[propAsRes.prop]
    else {
      const rRelationshipNode = getRelationshipNode(detailedResValueSection, original[0], propAsRes.relationships)
      value = rRelationshipNode?.node?.[propAsRes.prop]
    }

    if (typeof value !== 'undefined') {
      res.now[detailedResValueSection.resKey] = [ value ]
      original = [ value ]
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function doPropAdjacentToRes (detailedResValueSection, res) {
  if (detailedResValueSection.resValue?.$o?.propAdjToRes) {
    let value
    let original = res.original[detailedResValueSection.resKey]

    const propAdjToRes = detailedResValueSection.resValue?.$o.propAdjToRes

    if (!propAdjToRes.relationships?.length) value = original?.[0]?.[propAdjToRes.sourceProp]
    else {
      const rRelationshipNode = getRelationshipNode(detailedResValueSection, original[0], propAdjToRes.relationships)
      value = rRelationshipNode?.node?.[propAdjToRes.sourceProp]
    }

    if (typeof value !== 'undefined') {
      res.now[propAdjToRes.adjacentProp] = value
      res.original[propAdjToRes.adjacentProp] = value
    }
  }
}
