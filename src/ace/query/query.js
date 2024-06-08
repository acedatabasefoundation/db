import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { doQueryOptions } from './doQueryOptions.js'
import { getOne, getMany } from '../../util/storage.js'
import { isObjectPopulated } from '../../util/isObjectPopulated.js'
import { getDetailedResValueSectionByParent, getDetailedResValueSectionById } from './getDetailedResValue.js'
import { getRelationshipProp, getSortIndexKey, getUniqueIndexKey, getNodeIdsKey, getRelationshipIdsKey } from '../../util/variables.js'


/**
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnCryptoJWKs } publicJWKs
 * @param { number } iReq
 * @param { td.AceQueryRequestItemNode } reqItem 
 * @returns { Promise<void> }
 */
export async function queryNode (res, publicJWKs, iReq, reqItem) {
  const { ids, detailedResValueSection, isUsingSortIndex } = await getInitialIds(reqItem)

  if (ids.length) await addNodesToResponse(detailedResValueSection, res, ids, isUsingSortIndex, publicJWKs, iReq)
  else {
    res.now[detailedResValueSection.resKey] = null
    res.original[detailedResValueSection.resKey] = null
  }
}


/**
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnCryptoJWKs } publicJWKs
 * @param { number } iReq
 * @param { td.AceQueryRequestItemRelationship } reqItem 
 * @returns { Promise<void> }
 */
export async function queryRelationship (res, publicJWKs, iReq, reqItem) {
  const { ids, detailedResValueSection, isUsingSortIndex } = await getInitialIds(reqItem)

  if (ids.length) await addRelationshipsToResponse(detailedResValueSection, res, ids, isUsingSortIndex, publicJWKs, iReq)
  else {
    res.now[detailedResValueSection.resKey] = null
    res.original[detailedResValueSection.resKey] = null
  }
}


/**
 * @param { td.AceQueryRequestItemNode | td.AceQueryRequestItemRelationship } reqItem
 * @returns { Promise<{ ids: any, isUsingSortIndex: any, detailedResValueSection: td.AceQueryRequestItemDetailedResValueSection }> }
 */
async function getInitialIds (reqItem) {
  /** @type { (string | number)[] | undefined } */
  let ids

  const detailedResValueSection = getDetailedResValueSectionById(reqItem)

  if (detailedResValueSection.resValue?.$o?.sort) {
    const sortIndexStorageKey = getSortIndexKey(detailedResValueSection.node || detailedResValueSection.relationship || '', detailedResValueSection.resValue?.$o?.sort.prop) // IF sorting by an property requested => see if property is a sort index
    if (sortIndexStorageKey) ids = await getOne(sortIndexStorageKey)
  }

  let isUsingSortIndex = false

  if (ids) isUsingSortIndex = true // IF property is a sort index => tip flag to true
  else {
    let isValid = true

    if (detailedResValueSection.resValue?.$o?.findById) ids = [ detailedResValueSection.resValue?.$o.findById ]
    else if (detailedResValueSection.resValue?.$o?.filterByIds) {
      ids = detailedResValueSection.resValue?.$o.filterByIds
      if (!ids.length) isValid = false
    } else if (detailedResValueSection.resValue?.$o?.findByUnique) {
      const key = getUniqueIndexKey(detailedResValueSection.node || detailedResValueSection.relationship || '', detailedResValueSection.resValue?.$o.findByUnique.prop, detailedResValueSection.resValue?.$o?.findByUnique.value)

      /** @type { string | number } */
      const id = await getOne(key)
      ids = id ? [ id ] : []
      if (!ids.length) isValid = false
    } else if (Array.isArray(detailedResValueSection.resValue?.$o?.filterByUniques?.uniques)) {
      /** @type { string[] } */
      const graphUniqueKeys = []

      for (const unique of detailedResValueSection.resValue.$o.filterByUniques.uniques) {
        graphUniqueKeys.push(getUniqueIndexKey(detailedResValueSection.node || detailedResValueSection.relationship || '', unique.prop, unique.value))
      }

      /** @type { (string | number)[] } */
      const graphUniqueNodeKeys = await getMany(graphUniqueKeys)

      if (graphUniqueNodeKeys.length === 0) isValid = false
      else ids = graphUniqueNodeKeys
    }

    if (isValid && !ids?.length) {
      ids = reqItem.do === 'NodeQuery' ?
        !detailedResValueSection.node ? [] : await getOne(getNodeIdsKey(detailedResValueSection.node)) :
        !detailedResValueSection.relationship ? [] : await getOne(getRelationshipIdsKey(detailedResValueSection.relationship))

      if (!ids) ids = []
    }
  }

  return {
    ids,
    isUsingSortIndex,
    detailedResValueSection
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { { now: any, original: any } } res 
 * @param { (string | number)[] } ids 
 * @param { boolean } isUsingSortIndex
 * @param { td.AceFnCryptoJWKs } jwks
 * @param { number } iReq
 * @param { td.AceGraphRelationshipProps[] } [ graphRelationshipProps ]
 * @returns { Promise<void> }
 */
async function addNodesToResponse (detailedResValueSection, res, ids, isUsingSortIndex, jwks, iReq, graphRelationshipProps) {
  /** @type { td.AceGraphNode[] } */
  const graphNodes = await getMany(ids)

  for (let i = 0; i < graphNodes.length; i++) {
    await addPropsToResponse(detailedResValueSection, res, { node: graphNodes[i] }, jwks, iReq, graphRelationshipProps?.[i])
  }

  await doQueryOptions(detailedResValueSection, res, isUsingSortIndex, jwks)
  removeEmptyObjects(detailedResValueSection, res)
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @returns { void }
 */
function removeEmptyObjects (detailedResValueSection, res) {
  if (Array.isArray(res.now[detailedResValueSection.resKey])) {
    for (let i = res.now[detailedResValueSection.resKey].length - 1; i >= 0; i--) {
      if (!isObjectPopulated(res.now[detailedResValueSection.resKey][i])) res.now[detailedResValueSection.resKey].splice(i, 1)
    }

    if (!res.now[detailedResValueSection.resKey].length) res.now[detailedResValueSection.resKey] = null
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { { now: any, original: any } } res 
 * @param { td.AceQueryAddPropsItem } item 
 * @param { td.AceFnCryptoJWKs } jwks
 * @param { number } iReq
 * @param { td.AceGraphRelationshipProps } [ graphRelationshipProps ]
 * @returns { Promise<void> }
 */
async function addPropsToResponse (detailedResValueSection, res, item, jwks, iReq, graphRelationshipProps) {
  let graphItem, id = ''

  if (item.node) {
    graphItem = item.node
    id = item.node?.props?.id
  } else if (item.relationship) {
    graphItem = item.relationship
  } else if (item.id) {
    id = item.id
    graphItem = await getOne(id)
  }

  if (!graphItem) {
    res.now[ detailedResValueSection.resKey ] = null
    res.original[ detailedResValueSection.resKey ] = null
  } else if (/** @type {*} */(detailedResValueSection.resValue) !== false) {
    const resOriginalItem = structuredClone(graphItem.props)
    const resNowItem = /** @type { { [propName: string]: any } } */ ({})

    if (graphRelationshipProps) {
      for (const prop in graphRelationshipProps) {
        if (prop.startsWith('_')) resOriginalItem[prop] = graphRelationshipProps[prop]
      }
    }

    /** @type { Map<string, { propNode: string, propValue: td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp }> | undefined } */
    const relationshipPropsMap = (item.relationship && Memory.txn.schemaDataStructures.relationshipPropsMap) ? Memory.txn.schemaDataStructures.relationshipPropsMap.get(detailedResValueSection.relationship || '') : undefined

    for (const reqResKey in detailedResValueSection.resValue) { // loop a section of query.x object
      const resValueItemValue = detailedResValueSection.resValue[reqResKey]

      /** @type { { schemaNodeProp?: td.AceSchemaProp | td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp, schemaRelationshipProp?: td.AceSchemaRelationshipProp } } - If graphItemType is node, add node info to this object  */
      const parentNodeOptions = {}

      if (!item.relationship) {
        parentNodeOptions.schemaNodeProp = Memory.txn.schema?.nodes[detailedResValueSection.node || '']?.[reqResKey]
        parentNodeOptions.schemaRelationshipProp = (detailedResValueSection.relationship) ? Memory.txn.schema?.relationships?.[detailedResValueSection.relationship]?.props?.[reqResKey] : undefined
      }

      if (reqResKey !== '$o' && (!detailedResValueSection.resHide || !detailedResValueSection.resHide?.has(reqResKey))) {
        if (typeof resOriginalItem[reqResKey] !== 'undefined') { // the graph item has the prop we are looking for
          if (resValueItemValue === true) resNowItem[reqResKey] = resOriginalItem[reqResKey] // they just want this value in the response
          else if (resValueItemValue?.alias) { // they want this value in the response but using an alias
            resNowItem[resValueItemValue.alias] = resOriginalItem[reqResKey] // add alias value to now
            resOriginalItem[resValueItemValue.alias] = resOriginalItem[reqResKey] // IF an alias is used add that alias prop onto the original (helpful @ new props when we are using the original to do calculations and the user may be using the alias prop name)
          }
        } else if (typeof graphRelationshipProps?.[reqResKey] !== 'undefined') { // this prop is defined @ schema.relationships
          if (resValueItemValue === true) resNowItem[reqResKey] = graphRelationshipProps[reqResKey]
          else if (resValueItemValue?.alias) {
            resNowItem[resValueItemValue.alias] = graphRelationshipProps[reqResKey]
            resOriginalItem[resValueItemValue.alias] = graphRelationshipProps[reqResKey]
          }
        } else if (parentNodeOptions.schemaNodeProp?.is === 'ForwardRelationshipProp' || parentNodeOptions.schemaNodeProp?.is === 'ReverseRelationshipProp' || parentNodeOptions.schemaNodeProp?.is === 'BidirectionalRelationshipProp') { // this prop is defined @ schema.nodes and is a SchemaRelationshipProp
          const relationshipIds = graphItem[getRelationshipProp(parentNodeOptions.schemaNodeProp.options.relationship)]
          await addRelationshipPropsToResponse(id, relationshipIds, parentNodeOptions.schemaNodeProp, reqResKey, resValueItemValue, detailedResValueSection, resNowItem, resOriginalItem, jwks, iReq)
        } else if (item.relationship && relationshipPropsMap) {
          const r = relationshipPropsMap.get(reqResKey)
          const schemaNodeProp = r?.propValue
          const relationshipDetailedResValueSection = getDetailedResValueSectionByParent(resValueItemValue, reqResKey, detailedResValueSection)  

          if (schemaNodeProp?.is === 'BidirectionalRelationshipProp') {
            const ids = [ resOriginalItem.a, resOriginalItem.b ]
            await addNodesToResponse(relationshipDetailedResValueSection, { now: resNowItem, original: resOriginalItem }, ids, false, jwks, iReq, [ resOriginalItem, resOriginalItem ])
          } else {
            let relationshipId
            if (schemaNodeProp?.is === 'ForwardRelationshipProp') relationshipId = resOriginalItem.b
            else if (schemaNodeProp?.is === 'ReverseRelationshipProp') relationshipId = resOriginalItem.a

            if (relationshipId) {
              await addPropsToResponse(relationshipDetailedResValueSection, { now: resNowItem, original: resOriginalItem }, { id: relationshipId }, jwks, iReq, resOriginalItem)
              
              if (resNowItem[relationshipDetailedResValueSection.resKey]?.length) resNowItem[relationshipDetailedResValueSection.resKey] = resNowItem[relationshipDetailedResValueSection.resKey][0]
              if (resOriginalItem[relationshipDetailedResValueSection.resKey]?.length) resOriginalItem[relationshipDetailedResValueSection.resKey] = resOriginalItem[relationshipDetailedResValueSection.resKey][0]
            }
          }
        }
      }
    }

    if (res.now[ detailedResValueSection.resKey ]?.length) {
      if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[ detailedResValueSection.resKey ].push(resNowItem)
      res.original[ detailedResValueSection.resKey ].push(resOriginalItem)
    } else {
      if (!detailedResValueSection.resHide || !detailedResValueSection.resHide.has(detailedResValueSection.resKey)) res.now[ detailedResValueSection.resKey ] = [ resNowItem ]
      res.original[ detailedResValueSection.resKey ] = [ resOriginalItem ]
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { td.AceFnFullResponse } res 
 * @param { (string | number)[] } ids 
 * @param { boolean } isUsingSortIndex
 * @param { td.AceFnCryptoJWKs } jwks
 * @param { number } iReq
 * @returns { Promise<void> }
 */
async function addRelationshipsToResponse (detailedResValueSection, res, ids, isUsingSortIndex, jwks, iReq) {
  if (detailedResValueSection.resValue?.$o?.findBy_Id) {
    if (ids.includes(detailedResValueSection.resValue?.$o.findBy_Id)) ids = [ detailedResValueSection.resValue?.$o.findBy_Id ]
  } else {
    if (detailedResValueSection.resValue?.$o?.filterBy_Ids?.length) {
      const set = new Set(detailedResValueSection.resValue?.$o.filterBy_Ids)

      for (let i = ids.length - 1; i >= 0; i--) {
        if (!set.has(ids[i])) ids.splice(i, 1)
      }
    }
  }

  /** @type { td.AceGraphRelationship[] } */
  const graphRelationships = await getMany(ids)

  for (let i = 0; i < graphRelationships.length; i++) {
    await addPropsToResponse(detailedResValueSection, res, { relationship: graphRelationships[i] }, jwks, iReq)
  }

  await doQueryOptions(detailedResValueSection, res, isUsingSortIndex, jwks)
  removeEmptyObjects(detailedResValueSection, res)
}


 /**
 * @param { string } id
 * @param { string[] } relationshipIds
 * @param { td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp | td.AceSchemaProp } schemaNodeProp
 * @param { string } reqResKey 
 * @param { any } resValueItemValue 
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { { [propName: string]: any } } resNowItem 
 * @param { any } resOriginalItem 
 * @param { td.AceFnCryptoJWKs } jwks
 * @param { number } iReq
 * @returns { Promise<void> }
 */
async function addRelationshipPropsToResponse (id, relationshipIds, schemaNodeProp, reqResKey, resValueItemValue, detailedResValueSection, resNowItem, resOriginalItem, jwks, iReq) {
  if (id && schemaNodeProp && relationshipIds?.length) {
    let findByIdFound = false
    let findBy_IdFound = false
    let findByUniqueFound = false
    let nodeIds = /** @type { (string | number)[] } */ ([])
    const graphRelationships = /** @type { any[] } */ ([])
    const relationshipDetailedResValueSection = getDetailedResValueSectionByParent(resValueItemValue, reqResKey, detailedResValueSection)  

    const uniqueKeys = /** @type { string[] } */ ([])

    if (detailedResValueSection.resValue?.$o?.findByUnique) uniqueKeys.push(getUniqueIndexKey(relationshipDetailedResValueSection.relationship || '', detailedResValueSection.resValue?.$o.findByUnique.prop, detailedResValueSection.resValue?.$o.findByUnique.value))
    else if (detailedResValueSection.resValue?.$o?.filterByUniques) {
      for (const unique of detailedResValueSection.resValue?.$o.filterByUniques.uniques) {
        uniqueKeys.push(getUniqueIndexKey(relationshipDetailedResValueSection.relationship || '', unique.prop, unique.value))
      }
    }

    /** @type { (string | number)[] } */
    const uniqueIds = (uniqueKeys.length) ? await getMany(uniqueKeys) : []

    /** @type { td.AceGraphRelationship[] } */
    const allGraphRelationships = await getMany(relationshipIds)

    switch (schemaNodeProp.is) {
      case 'ForwardRelationshipProp':
        for (const graphRelationship of allGraphRelationships) {
          if (id === graphRelationship.props.a) {
            const rForward = validateAndPushIds(relationshipDetailedResValueSection, graphRelationship.props.b, graphRelationships, graphRelationship, graphRelationship.props._id, nodeIds, uniqueIds, findByIdFound, findByUniqueFound, findBy_IdFound)
            if (rForward.findByIdFound) findByIdFound = true
            if (rForward.findByUniqueFound) findByUniqueFound = true
            if (rForward.findBy_IdFound) findBy_IdFound = true
          }
        }
        break
      case 'ReverseRelationshipProp':
        for (const graphRelationship of allGraphRelationships) {
          if (id === graphRelationship.props.b) {
            const rReverse = validateAndPushIds(relationshipDetailedResValueSection, graphRelationship.props.a, graphRelationships, graphRelationship, graphRelationship.props._id, nodeIds, uniqueIds, findByIdFound, findByUniqueFound, findBy_IdFound)
            if (rReverse.findByIdFound) findByIdFound = true
            if (rReverse.findByUniqueFound) findByUniqueFound = true
            if (rReverse.findBy_IdFound) findBy_IdFound = true
          }
        }
        break
      case 'BidirectionalRelationshipProp':
        for (const graphRelationship of allGraphRelationships) {
          const rBi = validateAndPushIds(relationshipDetailedResValueSection, id === graphRelationship.props.a ? graphRelationship.props.b : graphRelationship.props.a, graphRelationships, graphRelationship, graphRelationship.props._id, nodeIds, uniqueIds, findByIdFound, findByUniqueFound, findBy_IdFound)
          if (rBi.findByIdFound) findByIdFound = true
          if (rBi.findByUniqueFound) findByUniqueFound = true
          if (rBi.findBy_IdFound) findBy_IdFound = true
        }
        break
    }

    let isValid = true

    if (relationshipDetailedResValueSection.resValue?.$o?.findById) {
      if (findByIdFound) nodeIds = [relationshipDetailedResValueSection.resValue?.$o.findById ]
      else isValid = false
    }

    if (relationshipDetailedResValueSection.resValue?.$o?.findByUnique) {
      if (findByUniqueFound) nodeIds = [ uniqueIds[0] ]
      else isValid = false
    }

    if (relationshipDetailedResValueSection.resValue?.$o?.findBy_Id) {
      if (findBy_IdFound) nodeIds = [relationshipDetailedResValueSection.resValue?.$o.findBy_Id ]
      else isValid = false
    }

    if (isValid) await addNodesToResponse(relationshipDetailedResValueSection, { now: resNowItem, original: resOriginalItem }, nodeIds, false, jwks, iReq, graphRelationships)
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } relationshipDetailedResValueSection 
 * @param { string } id 
 * @param { any[] } graphRelationships 
 * @param { td.AceGraphRelationship } graphRelationship 
 * @param { string } graphRelationshipKey 
 * @param { (string | number)[] } nodeIds 
 * @param { (string | number)[] } uniqueIds 
 * @param { boolean } findByIdFound 
 * @param { boolean } findByUniqueFound 
 * @param { boolean } findBy_IdFound 
 * @returns { { findByIdFound: boolean, findByUniqueFound: boolean, findBy_IdFound: boolean } } 
 */
function validateAndPushIds (relationshipDetailedResValueSection, id, graphRelationships, graphRelationship, graphRelationshipKey, nodeIds, uniqueIds, findByIdFound, findByUniqueFound, findBy_IdFound) {
  const filterByIds = new Set(relationshipDetailedResValueSection.resValue.$o?.filterByIds)

  if (!filterByIds.has(id)) {
    const filterBy_Ids = new Set(relationshipDetailedResValueSection.resValue.$o?.filterBy_Ids)

    if (!filterBy_Ids.has(graphRelationshipKey)) {
      const filterByUniques = relationshipDetailedResValueSection.resValue.$o?.filterByUniques?.uniques?.find((unique => {
        return unique.prop === graphRelationshipKey && unique.value === graphRelationship.props[graphRelationshipKey]
      }))

      if (!filterByUniques) {
        nodeIds.push(id)
        graphRelationships.push(graphRelationship.props)

        if (String(relationshipDetailedResValueSection.resValue.$o?.findById) === id) findByIdFound = true
        else if (String(relationshipDetailedResValueSection.resValue.$o?.findBy_Id) === graphRelationshipKey) findBy_IdFound = true
        else if (String(relationshipDetailedResValueSection.resValue.$o?.findByUnique) && uniqueIds.length && uniqueIds[0] === id) findByUniqueFound = true
      }
    }
  }

  return { findByIdFound, findByUniqueFound, findBy_IdFound }
}
