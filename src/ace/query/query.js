import { td } from '#ace'
import { doLimit } from './doLimit.js'
import { Memory } from '../../objects/Memory.js'
import { decrypt } from '../../security/crypt.js'
import { doQueryOptions } from './doQueryOptions.js'
import { getOne, getMany } from '../../util/storage.js'
import { isObjectPopulated } from '../../util/isObjectPopulated.js'
import { getDetailedResValueSectionByParent, getDetailedResValueSectionById } from './getDetailedResValue.js'
import { getSortIndexKey, getUniqueIndexKey, getNodeIdsKey, getRelationship_IdsKey, vars } from '../../util/variables.js'


/**
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnCryptoJWKs } publicJWKs
 * @param { number } iReq
 * @param { td.AceFnOptions } options
 * @param { td.AceQueryRequestItemNode } reqItem 
 * @returns { Promise<void> }
 */
export async function queryNode (res, publicJWKs, iReq, options, reqItem) {
  const resGetInitialIds = await getInitialIds(reqItem)

  if (resGetInitialIds.ids.length) {
    if (reqItem.how.resValue !== 'count') await addNodesToResponse(resGetInitialIds.detailedResValueSection, res, resGetInitialIds.ids, resGetInitialIds.isUsingSortIndex, publicJWKs, iReq, options)
    else {
      res.now[resGetInitialIds.detailedResValueSection.resKey] = resGetInitialIds.ids.length
      res.original[resGetInitialIds.detailedResValueSection.resKey] = resGetInitialIds.ids.length
    }
  } else {
    res.now[resGetInitialIds.detailedResValueSection.resKey] = null
    res.original[resGetInitialIds.detailedResValueSection.resKey] = null
  }
}


/**
 * @param { td.AceFnFullResponse } res
 * @param { td.AceFnCryptoJWKs } publicJWKs
 * @param { number } iReq
 * @param { td.AceQueryRequestItemRelationship } reqItem 
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
export async function queryRelationship (res, publicJWKs, iReq, options, reqItem) {
  const resGetInitialIds = await getInitialIds(reqItem)

  if (resGetInitialIds.ids.length) await addRelationshipsToResponse(resGetInitialIds.detailedResValueSection, res, resGetInitialIds.ids, resGetInitialIds.isUsingSortIndex, publicJWKs, iReq, options)
  else {
    res.now[resGetInitialIds.detailedResValueSection.resKey] = null
    res.original[resGetInitialIds.detailedResValueSection.resKey] = null
  }
}


/**
 * @param { td.AceQueryRequestItemNode | td.AceQueryRequestItemRelationship } reqItem
 * @returns { Promise<{ ids: any, isUsingSortIndex: any, detailedResValueSection: td.AceQueryRequestItemDetailedResValueSection }> }
 */
async function getInitialIds (reqItem) {
  /** @type { { ids: (string | number)[], isUsingSortIndex: boolean, detailedResValueSection: td.AceQueryRequestItemDetailedResValueSection } } */
  const resGetInitialIds = {
    ids: [],
    isUsingSortIndex: false,
    detailedResValueSection: getDetailedResValueSectionById(reqItem)
  }

  if (resGetInitialIds.detailedResValueSection.resValue?.$o?.sort) {
    const sortIndexKey = getSortIndexKey(resGetInitialIds.detailedResValueSection.node || resGetInitialIds.detailedResValueSection.relationship || '', resGetInitialIds.detailedResValueSection.resValue?.$o?.sort.prop) // IF sorting by an property requested => see if property is a sort index

    if (sortIndexKey) {
      const sortIndexGraphItem = /** @type { td.AceGraphIndex | undefined } */ (await getOne(sortIndexKey));

      if (Array.isArray(sortIndexGraphItem?.index)) resGetInitialIds.ids = sortIndexGraphItem.index
    }
  }

  if (resGetInitialIds.ids.length) resGetInitialIds.isUsingSortIndex = true // IF property is a sort index => tip flag to true
  else {
    let isValid = true

    if (resGetInitialIds.detailedResValueSection.resValue?.$o?.findById) resGetInitialIds.ids = [ resGetInitialIds.detailedResValueSection.resValue?.$o.findById ]
    else if (resGetInitialIds.detailedResValueSection.resValue?.$o?.filterByIds) {
      resGetInitialIds.ids = resGetInitialIds.detailedResValueSection.resValue?.$o.filterByIds
      if (!resGetInitialIds.ids.length) isValid = false
    } else if (resGetInitialIds.detailedResValueSection.resValue?.$o?.findByUnique) {
      const key = getUniqueIndexKey(resGetInitialIds.detailedResValueSection.node || resGetInitialIds.detailedResValueSection.relationship || '', resGetInitialIds.detailedResValueSection.resValue?.$o.findByUnique.prop, resGetInitialIds.detailedResValueSection.resValue?.$o?.findByUnique.value)
      const uniqueIndexGraphItem = /** @type { td.AceGraphIndex | undefined } */ (await getOne(key));

      if (!uniqueIndexGraphItem) isValid = false
      else if (typeof uniqueIndexGraphItem.index !== 'string' && typeof uniqueIndexGraphItem.index !== 'number') isValid = false
      else resGetInitialIds.ids = [ uniqueIndexGraphItem.index ]
    } else if (Array.isArray(resGetInitialIds.detailedResValueSection.resValue?.$o?.filterByUniques?.uniques)) {
      /** @type { string[] } */
      const graphUniqueKeys = []

      for (let i = 0; i < resGetInitialIds.detailedResValueSection.resValue.$o.filterByUniques.uniques.length; i++) {
        graphUniqueKeys.push(getUniqueIndexKey(resGetInitialIds.detailedResValueSection.node || resGetInitialIds.detailedResValueSection.relationship || '', resGetInitialIds.detailedResValueSection.resValue.$o.filterByUniques.uniques[i].prop, resGetInitialIds.detailedResValueSection.resValue.$o.filterByUniques.uniques[i].value))
      }

      const graphUniqueNodeKeys = /** @type { td.AceGraphIndex[] } */ (await getMany(graphUniqueKeys))

      if (graphUniqueNodeKeys.length === 0) isValid = false
      else {
        resGetInitialIds.ids = []

        for (let i = 0; i < graphUniqueNodeKeys.length; i++) {
          if (typeof graphUniqueNodeKeys[i].index === 'number') resGetInitialIds.ids.push(/** @type { number } */ (graphUniqueNodeKeys[i].index))
        }
      }
    }

    if (isValid && !resGetInitialIds.ids?.length) {
      switch (reqItem.do) {
        case 'NodeQuery':
          if (resGetInitialIds.detailedResValueSection.node) {
            const graphItem = /** @type { td.AceGraphIndex | undefined } */ (await getOne(getNodeIdsKey(resGetInitialIds.detailedResValueSection.node)))
            if (graphItem && Array.isArray(graphItem.index)) resGetInitialIds.ids = graphItem.index
          }
          break
        case 'RelationshipQuery':
          if (resGetInitialIds.detailedResValueSection.relationship) {
            const graphItem = /** @type { td.AceGraphIndex | undefined } */ (await getOne(getRelationship_IdsKey(resGetInitialIds.detailedResValueSection.relationship)))
            if (graphItem && Array.isArray(graphItem.index)) resGetInitialIds.ids = graphItem.index
          }
          break
      }

      if (!resGetInitialIds.ids) resGetInitialIds.ids = []
    }
  }

  if (resGetInitialIds.ids && resGetInitialIds.detailedResValueSection.resValue.$o) {
    let limitPassed = false
    let allowedToLimit = true // IF no $o below 'limit' in preQueryOptionsFlow or defaultQueryOptionsFlow

    for (let i = 0; i < vars.preQueryOptionsFlow.length; i++) {
      if (limitPassed && resGetInitialIds.detailedResValueSection.resValue.$o[/** @type {keyof td.AceQueryRequestItemNodeOptions} */(vars.preQueryOptionsFlow[i])]) {
        allowedToLimit = false
        break
      }

      if (vars.preQueryOptionsFlow[i] === 'limit') limitPassed = true
    }

    if (allowedToLimit) {
      for (let i = 0; i < vars.defaultQueryOptionsFlow.length; i++) {
        if (resGetInitialIds.detailedResValueSection.resValue.$o[/** @type {keyof td.AceQueryRequestItemNodeOptions} */(vars.preQueryOptionsFlow[i])] && vars.preQueryOptionsFlow[i] !== 'limit') {
          allowedToLimit = false
          break
        }
      }
    }

    if (allowedToLimit) resGetInitialIds.ids = doLimit(resGetInitialIds.detailedResValueSection.resValue.$o, resGetInitialIds.ids)
  }

  return resGetInitialIds
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { { now: any, original: any } } res 
 * @param { (string | number)[] } ids 
 * @param { boolean } isUsingSortIndex
 * @param { td.AceFnCryptoJWKs } jwks
 * @param { number } iReq
 * @param { td.AceFnOptions } options
 * @param { (td.AceGraphRelationship)[] } [ graphRelationships ]
 * @returns { Promise<void> }
 */
async function addNodesToResponse (detailedResValueSection, res, ids, isUsingSortIndex, jwks, iReq, options, graphRelationships) {
  const graphNodes = /** @type { td.AceGraphNode[] } */ (await getMany(ids))

  for (let i = 0; i < graphNodes.length; i++) {
    await addPropsToResponse(detailedResValueSection, res, { node: graphNodes[i] }, jwks, iReq, options, graphRelationships?.[i])
  }

  await doQueryOptions(detailedResValueSection, res, isUsingSortIndex, jwks, options)
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
 * @param { td.AceFnOptions } options
 * @param { td.AceGraphRelationship } [ graphRelationship ]
 * @returns { Promise<void> }
 */
async function addPropsToResponse (detailedResValueSection, res, item, jwks, iReq, options, graphRelationship) {
  let graphItem

  if (item.node) graphItem = item.node
  else if (item.relationship) graphItem = item.relationship
  else if (item.id) graphItem = await getOne(item.id)

  if (!graphItem) {
    res.now[ detailedResValueSection.resKey ] = null
    res.original[ detailedResValueSection.resKey ] = null
  } else if (/** @type {*} */(detailedResValueSection.resValue) !== false) {
    const resNowItem = /** @type { { [propName: string]: any } } */ ({})
    const resOriginalItem = { ...graphItem }

    /** @type { Map<string, { propNode: string, propValue: td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp }> | undefined } */
    const relationshipPropsMap = (item.relationship && Memory.txn.schemaDataStructures.relationshipPropsMap) ? Memory.txn.schemaDataStructures.relationshipPropsMap.get(detailedResValueSection.relationship || '') : undefined

    for (const resValueKey in detailedResValueSection.resValue) { // loop a section of query.x object
      const resValueItemValue = /** @type { td.AceQueryResValuePropValue | td.AceQueryRequestItemNodeResValue } */ (detailedResValueSection.resValue[resValueKey])
      const parentNodeOptions = item.relationship ? 
        {} : 
        {
          schemaNodeProp: !Memory.txn.schema || !detailedResValueSection.node || !Memory.txn.schema.nodes[detailedResValueSection.node] ?
            undefined :
            Memory.txn.schema.nodes[detailedResValueSection.node][resValueKey],
          schemaRelationshipProp: !Memory.txn.schema || !Memory.txn.schema.relationships || !detailedResValueSection.relationship || !Memory.txn.schema.relationships[detailedResValueSection.relationship] || !Memory.txn.schema.relationships[detailedResValueSection.relationship].props ?
            undefined :
            /** @type { td.AceSchemaRelationshipProps } */ (Memory.txn.schema.relationships[detailedResValueSection.relationship].props)[resValueKey]
        }

      if (resValueKey !== '$o' && (!detailedResValueSection.resHide || !detailedResValueSection.resHide?.has(resValueKey))) {
        let decrypted

        // node id is requested
        if (resValueKey === 'id') {
          if (typeof resValueItemValue === 'object' && resValueItemValue.alias) {
            resNowItem[resValueItemValue.alias] = resOriginalItem.$aK
            resOriginalItem[resValueItemValue.alias] = resOriginalItem.$aK
          } else {
            resNowItem.id = resOriginalItem.$aK
            resOriginalItem.id = resOriginalItem.$aK
          }
        }

        // relationship _id is requested
        else if (resValueKey === '_id' && graphRelationship) {
          if (typeof resValueItemValue === 'object' && resValueItemValue.alias) {
            resNowItem[resValueItemValue.alias] = graphRelationship.$aK
            resOriginalItem[resValueItemValue.alias] = graphRelationship.$aK
          } else {
            resNowItem._id = graphRelationship.$aK
            resOriginalItem._id = graphRelationship.$aK
          }
        }

        // the graph item has the key we are looking for
        else if (typeof resOriginalItem[resValueKey] !== 'undefined' && parentNodeOptions.schemaNodeProp?.is === 'Prop') {
          if (typeof resValueItemValue === 'object' && resValueItemValue.jwk && resValueItemValue.iv && options.ivs && jwks) decrypted = await decrypt(resOriginalItem[resValueKey], options.ivs[resValueItemValue.iv], jwks.crypt[resValueItemValue.jwk])

          if (typeof resValueItemValue !== 'object' || !resValueItemValue.alias) resNowItem[resValueKey] = decrypted || resOriginalItem[resValueKey] // they just want this value in the response
          else { // they want this value in the response but using an alias
            resNowItem[resValueItemValue.alias] = decrypted || resOriginalItem[resValueKey] // add alias value to now
            resOriginalItem[resValueItemValue.alias] = decrypted || resOriginalItem[resValueKey] // IF an alias is used add that alias prop onto the original (helpful @ new props when we are using the original to do calculations and the user may be using the alias prop name)
          }
        }

        // the graph relationship props have the key we are looking for (false positive potential)
        else if (typeof graphRelationship?.[resValueKey] !== 'undefined') {
          if (resValueItemValue === true) resNowItem[resValueKey] = graphRelationship[resValueKey]
          else if (typeof resValueItemValue === 'object' && resValueItemValue.alias) {
            resNowItem[resValueItemValue.alias] = graphRelationship[resValueKey]
            resOriginalItem[resValueItemValue.alias] = graphRelationship[resValueKey]
          }
        }

        // this key is a SchemaRelationshipProp (relationship key that points to nodes and not a prop key)
        else if (parentNodeOptions.schemaNodeProp?.is === 'ForwardRelationshipProp' || parentNodeOptions.schemaNodeProp?.is === 'ReverseRelationshipProp' || parentNodeOptions.schemaNodeProp?.is === 'BidirectionalRelationshipProp') {
          const relationship_Ids = graphItem[parentNodeOptions.schemaNodeProp.options.relationship]
          await addRelationshipPropsToResponse(graphItem.$aK, relationship_Ids, parentNodeOptions.schemaNodeProp, resValueKey, resValueItemValue, detailedResValueSection, resNowItem, resOriginalItem, jwks, iReq, options)
        }

        // this is a relationship query and the key we are populating is a relationship key that points to nodes and not a prop key
        else if (item.relationship && relationshipPropsMap?.has(resValueKey)) {
          const r = relationshipPropsMap.get(resValueKey)
          const schemaNodeProp = r?.propValue
          const relationshipDetailedResValueSection = getDetailedResValueSectionByParent(/** @type { td.AceQueryRequestItemNodeResValue } */ (resValueItemValue), resValueKey, detailedResValueSection)  

          if (schemaNodeProp?.is === 'BidirectionalRelationshipProp') {
            const ids = [ resOriginalItem.a, resOriginalItem.b ]
            await addNodesToResponse(relationshipDetailedResValueSection, { now: resNowItem, original: resOriginalItem }, ids, false, jwks, iReq, options, [ /** @type { td.AceGraphRelationship } */(resOriginalItem), /** @type { td.AceGraphRelationship } */(resOriginalItem) ])
          } else {
            let relationship_Id
            if (schemaNodeProp?.is === 'ForwardRelationshipProp') relationship_Id = resOriginalItem.b
            else if (schemaNodeProp?.is === 'ReverseRelationshipProp') relationship_Id = resOriginalItem.a

            if (relationship_Id) {
              await addPropsToResponse(relationshipDetailedResValueSection, { now: resNowItem, original: resOriginalItem }, { id: relationship_Id }, jwks, iReq, options, /** @type { td.AceGraphRelationship } */(resOriginalItem))
              
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
 * @param { (string | number)[] } _ids 
 * @param { boolean } isUsingSortIndex
 * @param { td.AceFnCryptoJWKs } jwks
 * @param { number } iReq
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
async function addRelationshipsToResponse (detailedResValueSection, res, _ids, isUsingSortIndex, jwks, iReq, options) {
  if (detailedResValueSection.resValue?.$o?.findBy_Id) {
    if (_ids.includes(detailedResValueSection.resValue?.$o.findBy_Id)) _ids = [ detailedResValueSection.resValue?.$o.findBy_Id ]
  } else {
    if (detailedResValueSection.resValue?.$o?.filterBy_Ids?.length) {
      const set = new Set(detailedResValueSection.resValue?.$o.filterBy_Ids)

      for (let i = _ids.length - 1; i >= 0; i--) {
        if (!set.has(_ids[i])) _ids.splice(i, 1)
      }
    }
  }

  const graphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(_ids))

  for (let i = 0; i < graphRelationships.length; i++) {
    await addPropsToResponse(detailedResValueSection, res, { relationship: graphRelationships[i] }, jwks, iReq, options)
  }

  await doQueryOptions(detailedResValueSection, res, isUsingSortIndex, jwks, options)
  removeEmptyObjects(detailedResValueSection, res)
}


 /**
 * @param { string } id
 * @param { string[] } relationship_Ids
 * @param { td.AceSchemaForwardRelationshipProp | td.AceSchemaReverseRelationshipProp | td.AceSchemaBidirectionalRelationshipProp | td.AceSchemaProp } schemaNodeProp
 * @param { string } resValueKey 
 * @param { any } resValueItemValue 
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSection 
 * @param { { [propName: string]: any } } resNowItem 
 * @param { any } resOriginalItem 
 * @param { td.AceFnCryptoJWKs } jwks
 * @param { number } iReq
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
async function addRelationshipPropsToResponse (id, relationship_Ids, schemaNodeProp, resValueKey, resValueItemValue, detailedResValueSection, resNowItem, resOriginalItem, jwks, iReq, options) {
  if (id && schemaNodeProp && relationship_Ids?.length) {
    if (resValueItemValue === 'count') {
      resNowItem[resValueKey] = relationship_Ids.length
      resOriginalItem[resValueKey] = relationship_Ids.length
    } else {
      let findByIdFound = false
      let findBy_IdFound = false
      let findByUniqueFound = false

      /** @type { (string | number)[] } */
      let nodeIds = []

      /** @type { string[] } */
      const uniqueKeys = []

      /** @type { td.AceGraphRelationship[] } */
      const graphRelationships = []

      const relationshipDetailedResValueSection = getDetailedResValueSectionByParent(resValueItemValue, resValueKey, detailedResValueSection)  

      if (detailedResValueSection.resValue?.$o?.findByUnique) uniqueKeys.push(getUniqueIndexKey(relationshipDetailedResValueSection.relationship || '', detailedResValueSection.resValue?.$o.findByUnique.prop, detailedResValueSection.resValue?.$o.findByUnique.value))
      else if (detailedResValueSection.resValue?.$o?.filterByUniques) {
        for (let i = 0; i < detailedResValueSection.resValue?.$o.filterByUniques.uniques.length; i++) {
          uniqueKeys.push(getUniqueIndexKey(relationshipDetailedResValueSection.relationship || '', detailedResValueSection.resValue?.$o.filterByUniques.uniques[i].prop, detailedResValueSection.resValue?.$o.filterByUniques.uniques[i].value))
        }
      }

      const uniqueIds = /** @type { td.AceGraphIndex | undefined } */ ((uniqueKeys.length) ? await getMany(uniqueKeys) : undefined);
      const allGraphRelationships = /** @type { td.AceGraphRelationship[] } */ (await getMany(relationship_Ids));

      switch (schemaNodeProp.is) {
        case 'ForwardRelationshipProp':
          for (const graphRelationship of allGraphRelationships) {
            if (id === graphRelationship.a) {
              const rForward = validateAndPushIds(relationshipDetailedResValueSection, graphRelationship.b, graphRelationships, graphRelationship, graphRelationship.$aK, nodeIds, uniqueIds, findByIdFound, findByUniqueFound, findBy_IdFound)
              if (rForward.findByIdFound) findByIdFound = true
              if (rForward.findByUniqueFound) findByUniqueFound = true
              if (rForward.findBy_IdFound) findBy_IdFound = true
            }
          }
          break
        case 'ReverseRelationshipProp':
          for (const graphRelationship of allGraphRelationships) {
            if (id === graphRelationship.b) {
              const rReverse = validateAndPushIds(relationshipDetailedResValueSection, graphRelationship.a, graphRelationships, graphRelationship, graphRelationship.$aK, nodeIds, uniqueIds, findByIdFound, findByUniqueFound, findBy_IdFound)
              if (rReverse.findByIdFound) findByIdFound = true
              if (rReverse.findByUniqueFound) findByUniqueFound = true
              if (rReverse.findBy_IdFound) findBy_IdFound = true
            }
          }
          break
        case 'BidirectionalRelationshipProp':
          for (const graphRelationship of allGraphRelationships) {
            const rBi = validateAndPushIds(relationshipDetailedResValueSection, id === graphRelationship.a ? graphRelationship.b : graphRelationship.a, graphRelationships, graphRelationship, graphRelationship.$aK, nodeIds, uniqueIds, findByIdFound, findByUniqueFound, findBy_IdFound)
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
        if (findByUniqueFound && Array.isArray(uniqueIds?.index)) nodeIds = [ uniqueIds.index[0] ]
        else isValid = false
      }

      if (relationshipDetailedResValueSection.resValue?.$o?.findBy_Id) {
        if (findBy_IdFound) nodeIds = [relationshipDetailedResValueSection.resValue?.$o.findBy_Id ]
        else isValid = false
      }

      if (isValid) await addNodesToResponse(relationshipDetailedResValueSection, { now: resNowItem, original: resOriginalItem }, nodeIds, false, jwks, iReq, options, graphRelationships)
    }
  }
}


/**
 * @param { td.AceQueryRequestItemDetailedResValueSection } relationshipDetailedResValueSection 
 * @param { string | number } id 
 * @param { td.AceGraphRelationship[] } graphRelationships 
 * @param { td.AceGraphRelationship } graphRelationship 
 * @param { string | number } graphRelationshipKey 
 * @param { (string | number)[] } nodeIds 
 * @param { td.AceGraphIndex | undefined } uniqueIds 
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
        return unique.prop === graphRelationshipKey && unique.value === graphRelationship[graphRelationshipKey]
      }))

      if (!filterByUniques) {
        nodeIds.push(id)
        graphRelationships.push(graphRelationship)

        if (String(relationshipDetailedResValueSection.resValue.$o?.findById) === id) findByIdFound = true
        else if (String(relationshipDetailedResValueSection.resValue.$o?.findBy_Id) === graphRelationshipKey) findBy_IdFound = true
        else if (String(relationshipDetailedResValueSection.resValue.$o?.findByUnique) && Array.isArray(uniqueIds?.index) && uniqueIds.index?.[0] === id) findByUniqueFound = true
      }
    }
  }

  return { findByIdFound, findByUniqueFound, findBy_IdFound }
}
