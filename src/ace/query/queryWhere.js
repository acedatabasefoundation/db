import { td, enums } from '#ace'
import { verify } from '../../security/hash.js'
import { Memory } from '../../objects/Memory.js'
import { AceError } from '../../objects/AceError.js'
import { getRelationshipNode } from './getRelationshipNode.js'


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @param { enums.queryOptions } option 
 * @param { td.AceFnCryptoJWKs } jwks 
 */
export async function queryWhere (detailedResValueSection, res, option, jwks) {
  if (Array.isArray(res.original[detailedResValueSection.resKey])) {
    /** @type { any[] } To avoid splicing the orignal till we have validated what we have done, copy original */
    const ogCopy = JSON.parse(JSON.stringify(res.original[detailedResValueSection.resKey]))

    /** Because we can splice the ogCopy array but we are looping forwards iCopy is not the index we want to use when wanting to know at what index of original are we at now. We loop forwards so that we can find the first occurence of something from the beginning.  */
    let iOriginal = 0

    /** The current where (find/filter) we are applying */
    const $where = detailedResValueSection.resValue?.$o?.[option]

    /** @type { Set<string> } If we did not splice that means we found a match. If we found a match for any findOptions we can break the loop */
    const findOptions = new Set([
      enums.queryOptions.findByOr,
      enums.queryOptions.findByAnd,
      enums.queryOptions.findByDefined,
      enums.queryOptions.findByUndefined,
      enums.queryOptions.findByPropValue,
      enums.queryOptions.findByPropProp,
      enums.queryOptions.findByPropRes,
    ])

    /** @type { Set<string> } If the option is a group option => loopGroupQueries() */
    const groupOptions = new Set([
      enums.queryOptions.findByOr,
      enums.queryOptions.findByAnd,
      enums.queryOptions.filterByOr,
      enums.queryOptions.filterByAnd,
    ])

    for (let iCopy = 0; iCopy < ogCopy.length; iCopy++) {
      let spliced = false

      if (groupOptions.has(/** @type {*} */ (option))) spliced = await loopGroupQueries(/** @type { td.AceQueryFindGroup | td.AceQueryFilterGroup } */($where), option, iOriginal, true, detailedResValueSection, res, jwks)
      else spliced = await verifySplice($where, option, iOriginal, ogCopy[iCopy], true, detailedResValueSection, res, jwks)

      if (!spliced && findOptions.has(option)) { // If we did not splice that means we found a match. If we found a match for any findOptions we can break the loop
        res.now[detailedResValueSection.resKey] = [ res.now[detailedResValueSection.resKey][iOriginal] ]
        res.original[detailedResValueSection.resKey] = [ res.original[detailedResValueSection.resKey][iOriginal] ]
        break
      }

      if (!spliced) iOriginal++
    }

    if (Array.isArray(res.original[detailedResValueSection.resKey]) && !res.original[detailedResValueSection.resKey].length) {
      res.now[detailedResValueSection.resKey] = null
      res.original[detailedResValueSection.resKey] = null
    }
  }
}


/**
 * @param { td.AceQueryFindGroup | td.AceQueryFilterGroup } $where 
 * @param { enums.queryOptions} option 
 * @param { number } iOriginal 
 * @param { boolean } doSplice 
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @param { td.AceFnCryptoJWKs } jwks
 * @returns { Promise<boolean> }
 */
async function loopGroupQueries ($where, option, iOriginal, doSplice, detailedResValueSection, res, jwks) {
  let spliced = false

  switch (option) {
    case 'findByOr':
    case 'filterByOr':
      let keepArrayItem = false

      for (const $whereItem of $where) {
        if ((await innerLoopGroupQueries(/** @type { td.AceQueryWherePropValue | td.AceQueryWherePropProp | td.AceQueryWherePropRes | td.AceQueryWhereDefined | td.AceQueryWhereUndefined | td.AceQueryFindGroup | td.AceQueryFilterGroup } */($whereItem), getGroupItemOption(option, $where, $whereItem), iOriginal, detailedResValueSection, res, jwks)) === false) { // on first splice false => keepArrayItem <- true
          keepArrayItem = true
          break
        }
      }

      if (!keepArrayItem) {
        spliced = true
        if (doSplice) {
          splice(detailedResValueSection, res, iOriginal)		
        }
      }
      break
    case 'findByAnd':
    case 'filterByAnd':
      let removeArrayItem = false

      for (const $whereItem of $where) {
        if ((await innerLoopGroupQueries(/** @type { td.AceQueryWherePropValue | td.AceQueryWherePropProp | td.AceQueryWherePropRes | td.AceQueryWhereDefined | td.AceQueryWhereUndefined | td.AceQueryFindGroup | td.AceQueryFilterGroup } */($whereItem), getGroupItemOption(option, $where, $whereItem), iOriginal, detailedResValueSection, res, jwks)) === true) { // on first splice true => removeArrayItem <- true
          removeArrayItem = true
          break
        }
      }

      if (removeArrayItem) {
        spliced = true
        if (doSplice) splice(detailedResValueSection, res, iOriginal)
      }
      break
  }

  return spliced
}


/**
 * @param { td.AceQueryWherePropValue | td.AceQueryWherePropProp | td.AceQueryWherePropRes | td.AceQueryWhereDefined | td.AceQueryWhereUndefined | td.AceQueryFindGroup | td.AceQueryFilterGroup } $where
 * @param { enums.queryOptions } option 
 * @param { number } iOriginal 
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @param { td.AceFnCryptoJWKs } jwks
 * @returns { Promise<boolean | undefined> }
 */
async function innerLoopGroupQueries ($where, option, iOriginal, detailedResValueSection, res, jwks) {
  let r

  switch (option) {
    case 'findByDefined':
    case 'findByUndefined':
    case 'findByPropValue':
    case 'findByPropProp':
    case 'findByPropRes':
    case 'filterByDefined':
    case 'filterByUndefined':
    case 'filterByPropValue':
    case 'filterByPropProp':
    case 'filterByPropRes':
      r = await verifySplice($where, option, iOriginal, res.original[detailedResValueSection.resKey][iOriginal], false, detailedResValueSection, res, jwks)
      break
    case 'findByOr':
    case 'findByAnd':
    case 'filterByOr':
    case 'filterByAnd':
      r = loopGroupQueries(/** @type { td.AceQueryFindGroup | td.AceQueryFilterGroup } */($where), /** @type { enums.queryOptions } */(option), iOriginal, false, detailedResValueSection, res, jwks)
      break
  }

  return r
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @param { number } iOriginal 
 */
function splice (detailedResValueSection, res, iOriginal) {
  res.now[detailedResValueSection.resKey].splice(iOriginal, 1)
  res.original[detailedResValueSection.resKey].splice(iOriginal, 1)
}


/**
 * @param { any } $where 
 * @param { enums.queryOptions} option 
 * @param { number } iOriginal 
 * @param { any } graphNode 
 * @param { boolean } doSplice 
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @param { td.AceFnCryptoJWKs } jwks
 * @returns { Promise<boolean> }
 */
async function verifySplice ($where, option, iOriginal, graphNode, doSplice, detailedResValueSection, res, jwks) {
  let spliced = false

  const bye = () => {
    if (doSplice) splice(detailedResValueSection, res, iOriginal)
    spliced = true
  }

  if (option === 'findByDefined' || option === 'filterByDefined') {
    if (typeof getValue($where?.isPropDefined ? { prop: $where.isPropDefined } : { prop: $where }, 'prop', graphNode, detailedResValueSection, res).value === 'undefined') bye()
  } else if (option === 'findByUndefined' || option === 'filterByUndefined') {
    if (typeof getValue($where?.isPropUndefined ? { prop: $where.isPropUndefined } : { prop: $where }, 'prop', graphNode, detailedResValueSection, res).value !== 'undefined') bye()
  } else {
    const qw = /** @type { td.AceQueryWherePropProp | td.AceQueryWherePropRes | td.AceQueryWherePropValue } */ ($where)
    const left = getValue(qw[0], 'prop', graphNode, detailedResValueSection, res)

    /** @type { 'prop' | 'res' | 'value' } */
    let rightIs

    if (option === 'findByPropProp' || option === 'filterByPropProp') rightIs = 'prop'
    else if (option === 'findByPropRes' || option === 'filterByPropRes') rightIs = 'res'
    else rightIs = 'value'

    const right = getValue(qw[2], rightIs, graphNode, detailedResValueSection, res)
    const isUndefined = typeof left.value === 'undefined' || typeof right.value === 'undefined'

    switch (qw[1]) {
      case 'equals':
        if (isUndefined) bye()
        else if (isLeftOrRightHash(qw, left, right, 0)) { if (!(await isHashValid(qw, left, right, 0, detailedResValueSection, option, jwks))) bye() }
        else if (isLeftOrRightHash(qw, left, right, 1)) { if (!(await isHashValid(qw, left, right, 1, detailedResValueSection, option, jwks))) bye() }
        else if (left.value !== right.value) bye()
        break
      case 'doesNotEqual':
        if (isUndefined || left.value === right.value) bye()
        break
      case 'greaterThan':
        if (isUndefined || left.value <= Number(right.value)) bye()
        break
      case 'lessThan':
        if (isUndefined || left.value >= Number(right.value)) bye()
        break
      case 'greaterThanOrEqualTo':
        if (isUndefined || left.value < Number(right.value)) bye()
        break
      case 'lessThanOrEqualTo':
        if (isUndefined || left.value > Number(right.value)) bye()
        break
      case 'startsWith':
        if (isUndefined || typeof left.value !== 'string' || !left.value.startsWith(String(right.value))) bye()
        break
      case 'endsWith':
        if (isUndefined || typeof left.value !== 'string' || !left.value.endsWith(String(right.value))) bye()
        break
      case 'contains':
        if (isUndefined || typeof left.value !== 'string' || !left.value.includes(String(right.value))) bye()
        break
      case 'doesNotContain':
        if (isUndefined || typeof left.value !== 'string' || left.value.includes(String(right.value.value))) bye()
        break
      case 'isoIsBefore':
        if (isUndefined || new Date(left.value) >= new Date(right.value)) bye()
        break
      case 'isoIsAfter':
        if (isUndefined || new Date(left.value) <= new Date(right.value)) bye()
        break
    }
  }

  return spliced
}


/**
 * @param { td.AceQueryWhereItemProp | td.AceQueryWhereItemValue } item 
 * @param { 'prop' | 'value' | 'res' } is
 * @param { any } graphNode
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { td.AceQueyWhereGetValueResponse }
 */
function getValue (item, is, graphNode, detailedResValueSection, res) {
  let getValueResponse = /** @type { td.AceQueyWhereGetValueResponse } */ ({ is, value: null, detailedResValueSection: null })

  switch (is) {
    case 'value':
      getValueResponse.value = item
      getValueResponse.detailedResValueSection = detailedResValueSection
      break
    case 'res':
      let resValue
      const itemRes = /** @type { td.AceQueryWhereItemRes } */ (item)

      for (let i = 0; i < itemRes.res.length; i++) {
        if (i === 0 && res.now[itemRes.res[i]]) resValue = res.now[itemRes.res[i]]
        else if (i > 0 && resValue[itemRes.res[i]]) resValue = resValue?.[itemRes.res[i]]
      }

      getValueResponse.value = resValue
      getValueResponse.detailedResValueSection = detailedResValueSection
      break
    case 'prop':
      const itemProp = /** @type { td.AceQueryWhereItemProp } */ (item)

      if (!itemProp.relationships?.length) {
        getValueResponse.value = graphNode[itemProp.prop]
        getValueResponse.detailedResValueSection = detailedResValueSection
      } else {
        const rRelationshipNode = getRelationshipNode(detailedResValueSection, graphNode, itemProp.relationships)

        if (rRelationshipNode?.node?.[itemProp.prop]) {
          getValueResponse.detailedResValueSection = rRelationshipNode.detailedResValueSection
          getValueResponse.value = rRelationshipNode.node[itemProp.prop]
        }
      }
      break
  }

  return getValueResponse
}


/**
 * @param { td.AceQueryWherePropProp | td.AceQueryWherePropRes | td.AceQueryWherePropValue } qw 
 * @param { td.AceQueyWhereGetValueResponse } left
 * @param { td.AceQueyWhereGetValueResponse } right
 * @param { number } sideIndex 
 * @returns { boolean }
 */
function isLeftOrRightHash (qw, left, right, sideIndex) {
  const side = sideIndex === 0 ? left : right
  return Boolean(side.is === 'prop' && side.detailedResValueSection && /** @type { td.AceSchemaProp } */ (Memory.txn.schema?.nodes?.[side.detailedResValueSection.node || '']?.[/** @type { td.AceQueryProp } */(qw[sideIndex]).prop])?.options?.dataType === enums.dataTypes.hash)
}


/**
 * @param { td.AceQueryWherePropProp | td.AceQueryWherePropRes | td.AceQueryWherePropValue } qw 
 * @param { td.AceQueyWhereGetValueResponse } left
 * @param { td.AceQueyWhereGetValueResponse } right
 * @param { number } sideIndex
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { enums.queryOptions } option 
 * @param { td.AceFnCryptoJWKs } jwks 
 * @returns { Promise<boolean> }
 */
async function isHashValid (qw, left, right, sideIndex, detailedResValueSection, option, jwks) {
  const jwkProp = detailedResValueSection.resValue?.$o?.publicJWKs?.[/** @type {'findByOr'} */ (option)]
  const publicJWK = jwkProp ? jwks.public[jwkProp] : null

  if (!jwkProp) throw AceError('aceFn__falsyHashPublicKey', `Please ensure $o.publicJWKs[${ option }] is truthy`, { $o: detailedResValueSection.resValue?.$o })
  if (!publicJWK) throw AceError('aceFn__invalidHashPublicKey', `Please ensure $o.publicJWKs[${ option }] is also in ace() options.jwks.public[${ option }]`, { qw })

  return sideIndex ?
    await verify(left.value, right.value, publicJWK) :
    await verify(right.value, left.value, publicJWK)
}


/**
 * @param { string } option 
 * @param { td.AceQueryFindGroup | td.AceQueryFilterGroup } group 
 * @param { * } groupItem 
 * @returns { enums.queryOptions }
 */
function getGroupItemOption (option, group, groupItem) {
  let groupItemOption
  const type = option.startsWith('find') ? 'find' : 'filter'
  const startsWith = type + 'By'

  if (/** @type { td.AceQueryWhereOr } */(groupItem).or) groupItemOption = startsWith + 'Or'
  else if (/** @type { td.AceQueryWhereAnd } */(groupItem).and) groupItemOption = startsWith + 'And'
  else if (/** @type { * } */(groupItem)?.length === 3 && /** @type { * } */(groupItem)?.[0]?.prop) {
    if (/** @type { td.AceQueryWherePropProp } */(groupItem)[2]?.prop) groupItemOption = startsWith + 'PropProp'
    else if (/** @type { td.AceQueryWherePropRes } */(groupItem)[2]?.res) groupItemOption = startsWith + 'PropRes'
    else groupItemOption = startsWith + 'PropValue'
  } else if (/** @type { td.AceQueryWhereDefined } */(groupItem)?.isPropDefined) groupItemOption = startsWith + 'Defined'
  else if (/** @type { td.AceQueryWhereUndefined } */(groupItem)?.isPropUndefined) groupItemOption = startsWith + 'Undefined'
  else throw AceError('aceFn__invalidQuerySearch', `Please ensure ${ type } is fomatted correctly`, { [type]: group })
  
  return /** @type { enums.queryOptions } */ (groupItemOption)
}
