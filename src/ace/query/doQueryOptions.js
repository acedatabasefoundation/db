import { td, enums } from '#ace'
import { doLimit } from './doLimit.js'
import { graphSort } from '../graphSort.js'
import { queryWhere } from './queryWhere.js'
import { getNewProps } from './getNewProps.js'
import { vars } from '../../util/variables.js'
import { Memory } from '../../objects/Memory.js'
import { Collator } from '../../objects/Collator.js'
import { AceError } from '../../objects/AceError.js'
import { getRelationshipNode } from './getRelationshipNode.js'


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @param { boolean } isUsingSortIndex 
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
export async function doQueryOptions (detailedResValueSection, res, isUsingSortIndex, jwks, options) {
  const $o = detailedResValueSection.resValue?.$o

  /** @type { boolean } Set to true when ...AsRes is used */
  let hasValueAsResponse = false

  if ($o) {
    /** @type { Set<string> } If we have completed an option put it in done */
    const doneOptions = new Set()

    if ($o.flow) { // do in requested flow order
      for (let i = 0; i < $o.flow.length; i++) {
        hasValueAsResponse = await doOption($o.flow[i], hasValueAsResponse, doneOptions, detailedResValueSection, $o, res, isUsingSortIndex, jwks, options)
      }
    }

    for (let i = 0; i < vars.defaultQueryOptionsFlow.length; i++) { // do in default flow order
      hasValueAsResponse = await doOption(vars.defaultQueryOptionsFlow[i], hasValueAsResponse, doneOptions, detailedResValueSection, $o, res, isUsingSortIndex, jwks, options)
    }

    for (let i = 0; i < vars.postQueryOptions.length; i++) { // do post flow order
      hasValueAsResponse = await doOption(vars.postQueryOptions[i], hasValueAsResponse, doneOptions, detailedResValueSection, $o, res, isUsingSortIndex, jwks, options)
    }
  }

  if (hasValueAsResponse || detailedResValueSection.schemaHas === 'one' || $o?.limit?.count === 1 || $o?.findById || $o?.findBy_Id || $o?.findByUnique || $o?.findByOr || $o?.findByAnd || $o?.findByDefined || $o?.findByUndefined || $o?.findByPropValue || $o?.findByPropProp || $o?.findByPropRes) {
    res.now[detailedResValueSection.resKey] = typeof res.now[detailedResValueSection.resKey]?.[0] === 'undefined' ? null : res.now[detailedResValueSection.resKey][0]
    res.original[detailedResValueSection.resKey] = typeof res.original[detailedResValueSection.resKey]?.[0] === 'undefined' ? null : res.original[detailedResValueSection.resKey][0]
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
 * @param { td.AceFnOptions } options
 * @returns { Promise<boolean> }
 */
async function doOption (option, hasValueAsResponse, doneOptions, detailedResValueSection, $o, res, isUsingSortIndex, jwks, options) {
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
        await queryWhere(detailedResValueSection, res, option, jwks, options)
        break

      case enums.queryOptions.limit:
        res.now[detailedResValueSection.resKey] = doLimit($o, res.now[detailedResValueSection.resKey])
        res.original[detailedResValueSection.resKey] = doLimit($o, res.now[detailedResValueSection.resKey])
        break

      case enums.queryOptions.sort:
        doSort($o, res, detailedResValueSection, isUsingSortIndex)
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
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { boolean } isUsingSortIndex 
 * @returns { void }
 */
function doSort ($o, res, detailedResValueSection, isUsingSortIndex) {
  if ($o.sort) {
    if (isUsingSortIndex) {
      if ($o.sort.how === 'dsc') { // sort index is stored asc, so if dsc is requested, do a reverse
        res.now[detailedResValueSection.resKey].reverse()
        res.original[detailedResValueSection.resKey].reverse()
      }
    } else {
      const combined = []
      const sort = $o.sort
      const collator = Collator()
      const prop = detailedResValueSection.resValue.$o?.sort?.prop

      if (!prop) throw new AceError('query__falsySortProp', 'Please ensure the $o.sort.prop is truthy', { $o: detailedResValueSection.resValue.$o })

      const dataType = detailedResValueSection.node ?
        geNodeSortPropDataType(detailedResValueSection, prop) :
        getRelationshipSortPropDataType(detailedResValueSection, prop)

      if (!dataType) throw new AceError('query__invalidSortProp', `Please ensure your sort prop "${ prop }" is defined in your schema or is an alias for a prop defined in your schema`, { $o: detailedResValueSection.resValue.$o })

      for (let i = 0; i < res.original[detailedResValueSection.resKey].length; i++) {
        combined.push({
          now: res.now[detailedResValueSection.resKey][i],
          original: res.original[detailedResValueSection.resKey][i],
        })
      }

      combined.sort((a, b) => {
        return graphSort(a.now[sort.prop], b.now[sort.prop], dataType, sort.how)
      })

      res.now[detailedResValueSection.resKey] = combined.map((value) => value.now)
      res.original[detailedResValueSection.resKey] = combined.map((value) => value.original)
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { string } prop 
 * @returns { enums.dataTypes | 'graphKey' | undefined }
 */
function geNodeSortPropDataType (detailedResValueSection, prop) {
  /** @type { enums.dataTypes | 'graphKey' | undefined } */
  let dataType

  if (prop === 'id') dataType = 'graphKey' 
  else {
    if (!detailedResValueSection.node || !Memory.txn.schema?.nodes?.[detailedResValueSection.node]) throw new AceError('query__invalidSortNode', `Please ensure the node in your query "${ detailedResValueSection.node }" is defined in your schema`, { node: detailedResValueSection.node })

    const schemaProp = Memory.txn.schema?.nodes[detailedResValueSection.node][prop]

    if (schemaProp?.is === 'Prop') dataType = /** @type { enums.dataTypes } */(schemaProp.options.dataType)
    else {
      for (const resKey in detailedResValueSection.resValue) {
        if (detailedResValueSection.resValue[resKey]?.alias === prop) {
          const aliasSchemaProp = Memory.txn.schema.nodes[detailedResValueSection.node]?.[resKey]

          if (aliasSchemaProp?.is === 'Prop') dataType = /** @type { enums.dataTypes } */(aliasSchemaProp.options.dataType)
          break
        }
      }
    }
  }

  return dataType
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { string } prop 
 * @returns { enums.dataTypes | 'graphKey' | undefined }
 */
function getRelationshipSortPropDataType (detailedResValueSection, prop) {
  /** @type { enums.dataTypes | 'graphKey' | undefined } */
  let dataType

  if (prop === '_id') dataType = 'graphKey'
  else {
    if (!detailedResValueSection.relationship || !Memory.txn.schema?.relationships?.[detailedResValueSection.relationship]) throw new AceError('query__invalidSortRelationship', `Please ensure the relationship in your query "${ detailedResValueSection.relationship }" is defined in your schema`, { relationship: detailedResValueSection.relationship })

    const schemaProp = Memory.txn.schema?.relationships?.[detailedResValueSection.relationship]?.props?.[prop]

    if (schemaProp?.is === 'RelationshipProp') dataType = /** @type { enums.dataTypes } */(schemaProp.options.dataType)
    else {
      for (const resKey in detailedResValueSection.resValue) {
        if (detailedResValueSection.resValue[resKey]?.alias === prop) {
          const aliasSchemaProp = Memory.txn.schema.relationships[detailedResValueSection.relationship]?.props?.[resKey]

          if (aliasSchemaProp?.is === 'RelationshipProp') dataType = /** @type { enums.dataTypes } */(aliasSchemaProp.options.dataType)
          break
        }
      }
    }
  }

  return dataType
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
        for (let j = 0; j < newPropKeys.length; j++) {
          const newPropsGroup = /** @type { td.AceQueryNewPropsGroup } */ ($o.newProps[newPropKeys[j]]);
          const newPropsValue = getNewProps(detailedResValueSection, res.original[detailedResValueSection.resKey][i], newPropsGroup);

          res.original[detailedResValueSection.resKey][i][newPropKeys[j]] = newPropsValue
          if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[detailedResValueSection.resKey][i][newPropKeys[j]] = newPropsValue
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

    for (let i = 0; i < res.original[resKey].length; i++) {
      sum += res.original[resKey][i][sumAsProp.computeProp]
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

    for (let i = 0; i < res.original[resKey].length; i++) {
      sum += res.original[resKey][i][$o.sumAsRes]
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

    for (let i = 0; i < original.length; i++) {
      sum += original[i][$o.avgAsProp.computeProp]
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

    for (let i = 0; i < original.length; i++) {
      sum += original[i][$o.avgAsRes]
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

    for (let i = 0; i < original.length; i++) {
      if (!amount || original[i][minAmtAsProp.computeProp] < amount) amount = original[i][minAmtAsProp.computeProp]
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

    for (let i = 0; i < original.length; i++) {
      if (!amount || original[i][$o.minAmtAsRes] < amount) amount = original[i][$o.minAmtAsRes]
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

    for (let i = 0; i < original.length; i++) {
      if (!amount || original[i][$o.maxAmtAsProp.computeProp] > amount) amount = original[i][$o.maxAmtAsProp.computeProp]
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

    for (let i = 0; i < original.length; i++) {
      if (!amount || original[i][$o.maxAmtAsRes] > amount) amount = original[i][$o.maxAmtAsRes]
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
    const count = getCount(res, resKey)

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
    const count = getCount(res, resKey)

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
    const count = getCount(res, resKey)

    res.now[resKey] = [count]
    res.original[resKey] = [count]
  }
}


/**
 * @param { td.AceFnFullResponse } res 
 * @param { string } resKey 
 * @returns { number }
 */
function getCount (res, resKey) {
  return res.original[resKey]?.length || 0
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
