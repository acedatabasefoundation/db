import { td } from '#ace'
import { memory } from '../../memory/memory.js'
import { AceError } from '../../objects/AceError.js'
import { enumIdToGraphId } from '../enumIdToGraphId.js'
import { isObjectPopulated } from '../../util/isObjectPopulated.js'


/**
 * @param { td.AceQueryRequestItemNode | td.AceQueryRequestItemRelationship } reqItem
 * @returns { td.AceQueryRequestItemDetailedResValueSection }
 */
export function getDetailedResValueSectionById (reqItem) {
  if (reqItem.do !== 'NodeQuery' && reqItem.do !== 'RelationshipQuery') throw AceError('aceFn__query__invalidId', `The reqItem.do is ${ /** @type {*} */ (reqItem).id } but it must be NodeQuery or RelationshipQuery`, { reqItem })

  const item = {}

  if (reqItem.do === 'NodeQuery') {
    if (!memory.txn.schema?.nodes[reqItem.how.node]) throw AceError('aceFn__query__invalidNode', `The the reqItem.node of ${ reqItem.how.node } is not a node in your schema`, { reqItem })
    item.node = reqItem.how.node
  } else if (reqItem.do === 'RelationshipQuery') {
    if (!memory.txn.schema?.relationships?.[reqItem.how.relationship]) throw AceError('aceFn__query__invalidRelationship', `The the reqItem.relationship of ${ reqItem.how.relationship }  is not a relationship in your schema`, { reqItem })
    item.relationship = reqItem.how.relationship
  }

  const resValue = updateWhereIds(fill(reqItem.how.resValue, item))

  /** @type { td.AceQueryRequestItemDetailedResValueSection } */
  const detailedResValueSection =  {
    resValue,
    do: reqItem.do,
    schemaHas: 'many',
    reqResKey: reqItem.how.resKey,
    resHide: getResHide(resValue),
    aliasResKey: resValue?.$o?.alias,
    resKey: resValue?.$o?.alias || reqItem.how.resKey,
  }

  if (/** @type { td.AceQueryRequestItemNode } */(reqItem).how.node) detailedResValueSection.node = /** @type { td.AceQueryRequestItemNode } */(reqItem).how.node
  else if (/** @type { td.AceQueryRequestItemRelationship } */(reqItem).how.relationship) detailedResValueSection.relationship = /** @type { td.AceQueryRequestItemRelationship } */(reqItem).how.relationship

  return detailedResValueSection
}


/**
 * @param { td.AceQueryRequestItemNodeResValue | '*' } reqResValue
 * @param { string } reqResKey
 * @param { td.AceQueryRequestItemDetailedResValueSection } detailedResValueSectionParent
 * @returns { td.AceQueryRequestItemDetailedResValueSection }
 */
export function getDetailedResValueSectionByParent (reqResValue, reqResKey, detailedResValueSectionParent) {
  let schemaPropValue

  const item = {}

  if (detailedResValueSectionParent.node) {
    item.node = /** @type { td.AceSchemaNodeRelationshipOptions } */ (memory.txn.schema?.nodes[detailedResValueSectionParent.node][reqResKey]?.options).node
    schemaPropValue = memory.txn.schema?.nodes?.[detailedResValueSectionParent.node]?.[reqResKey]
  } else if (detailedResValueSectionParent.relationship) {
    const node = memory.txn.schemaDataStructures.relationshipPropsMap.get(detailedResValueSectionParent.relationship)?.get(reqResKey)?.propNode

    if (node) {
      item.node = node
      schemaPropValue = memory.txn.schema?.nodes?.[node]?.[reqResKey]
    }
  }

  if (!schemaPropValue || schemaPropValue.is === 'Prop') throw AceError('aceFn__query__schemaPropValue', `Please ensure your query includes a prop in your resValue that is in your schema as a ForwardRelationshipProp, ReverseRelationshipProp or BidirectionalRelationshipProp. This is not happening yet at the prop: "${ reqResKey }"`, { prop: reqResKey, reqValue: reqResValue })

  const resValue = updateWhereIds(fill(reqResValue, item))

  return {
    resValue,
    do: detailedResValueSectionParent.do,
    reqResKey: reqResKey,
    schemaHas: schemaPropValue.options.has,
    resHide: getResHide(resValue),
    node: schemaPropValue.options.node,
    aliasResKey: resValue?.$o?.alias,
    resKey: resValue?.$o?.alias || reqResKey,
  }
}


/**
 * @param { td.AceQueryStars | td.AceQueryRequestItemNodeResValue } resValue
 * @param { { node?: string, relationship?: string } } item
 * @returns { td.AceQueryRequestItemNodeResValue | td.AceQueryRequestItemRelationshipResValue }
 */
function fill (resValue, item) {
  /** @type { undefined | td.AceQueryRequestItemNodeResValue | td.AceQueryRequestItemRelationshipResValue } */
  let updatedResValue

  const stars = getStars(resValue)

  if (stars) {
    if (item.node) updatedResValue = fillNodeQuery(stars, resValue, item.node)
    else if (item.relationship) updatedResValue = fillRelationshipQuery(stars, resValue, item.relationship)
  }

  const response = updatedResValue || resValue

  if (typeof response !== 'object' || Array.isArray(response) || !isObjectPopulated(response)) throw AceError('query__invalidQueryString', `Please ensure each query resValue is a valid object with propss from your schema or "*" o "**"  or "***". This is not happening yet for this resValue: ${ JSON.stringify(resValue) }`, { resValue })

  return response
}


/**
 * @param { td.AceQueryStars } stars 
 * @param { td.AceQueryStars | td.AceQueryRequestItemNodeResValue } resValue 
 * @param { string } rootNode 
 * @returns { td.AceQueryRequestItemNodeResValue | undefined }
 */
function fillNodeQuery (stars, resValue, rootNode) {
  /** @type { td.AceQueryRequestItemNodeResValue | undefined } */
  let updatedResValue

  if ((stars === '*' || stars === '**' || stars === '***') && rootNode && memory.txn.schema?.nodes) {
    updatedResValue = typeof resValue === 'string' ? { id: true } : { ...resValue, ...{ id: true } }

    /** @type { td.AceSchemaNodeValue | undefined } */
    const nodeProps1 = memory.txn.schema.nodes[rootNode] // for the root node, get its props from the schema

    if (nodeProps1) {
      for (const propName1 in nodeProps1) { // loop the root node
        if (nodeProps1[propName1].is === 'Prop') updatedResValue[propName1] = true // IF the prop does not point to a node THEN add prop to resValue
        else if (stars === '**' || stars === '***') { // IF prop points to a node THEN only continue if more levels requested
          /** @type { string } */
          const nodeName2 = /** @type { td.AceSchemaNodeRelationshipOptions } */ (nodeProps1[propName1].options).node // the node (level 2 node) that this prop points to

          /** @type { td.AceSchemaNodeValue | undefined } */
          const nodeProps2 = memory.txn.schema.nodes[nodeName2] // the props for the level 2 node

          updatedResValue[propName1] = { id: true, _id: true } // resValue initiation

          const relationship2 = /** @type { td.AceSchemaNodeRelationshipOptions } */ (nodeProps1?.[propName1]?.options)?.relationship // the relationship name between the level 2 node and the root node

          if (relationship2) { // IF there are props, @ the relationship between the level 2 node and the root node THEN add each relationship prop to resValue
            const relationshipProps2 = memory.txn.schema.relationships?.[relationship2]?.props

            if (relationshipProps2) {
              for (const relationshipPropName2 in relationshipProps2) {
                updatedResValue[propName1][relationshipPropName2] = true
              }
            }
          }

          if (nodeProps2) {
            for (const propName2 in nodeProps2) {

              if (nodeProps2[propName2].is === 'Prop') updatedResValue[propName1][propName2] = true // IF prop does not point to nodes THEN add prop to resValue
              else if (stars === '***') { //  // IF prop points to a node THEN only continue if 3 levels requested
                const nodeName3 = /** @type { td.AceSchemaNodeRelationshipOptions } */ (nodeProps2[propName2].options).node

                /** @type { td.AceSchemaNodeValue | undefined } */
                const nodeProps3 = memory.txn.schema.nodes[nodeName3] // the props for the level 2 node

                updatedResValue[propName1][propName2] = { id: true, _id: true }

                for (const propName3 in nodeProps3) { // IF the prop does not point to a node THEN add prop to resValue
                  if (nodeProps3[propName3].is === 'Prop') updatedResValue[propName1][propName2][propName3] = true
                }

                const relationship3 = /** @type { td.AceSchemaNodeRelationshipOptions } */ (nodeProps2?.[propName2]?.options)?.relationship // the relationship name between the level 3 node and the leve 2 node

                if (relationship3) { // IF there are props, @ the relationship between the level 2 node and level 3 node THEN add each relationship prop to resValue
                  const relationshipProps3 = memory.txn.schema.relationships?.[relationship3]?.props

                  if (relationshipProps3) {
                    for (const relationshipPropName3 in relationshipProps3) {
                      updatedResValue[propName1][propName2][relationshipPropName3] = true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return updatedResValue
}


/**
 * @param { td.AceQueryStars } stars 
 * @param { td.AceQueryStars | td.AceQueryRequestItemNodeResValue } resValue 
 * @param { string } rootRelationship 
 * @returns { td.AceQueryRequestItemRelationshipResValue | undefined }
 */
function fillRelationshipQuery (stars, resValue, rootRelationship) {
  /** @type { td.AceQueryRequestItemRelationshipResValue | undefined } */
  let updatedResValue

  if ((stars === '*' || stars === '**' || stars === '***') && rootRelationship && memory.txn.schema?.nodes && memory.txn.schema.relationships) {
    updatedResValue = typeof resValue === 'string' ? { _id: true } : { ...resValue, ...{ _id: true } }

    const relationshipProps1 = memory.txn.schema.relationships[rootRelationship]?.props // for the provided relationship (the root relationship), get its props from the schema

    if (relationshipProps1) { // IF there ae props for the root relationship THEN add props to resValue
      for (const relationshipPropName1 in relationshipProps1) {
        updatedResValue[relationshipPropName1] = true
      }
    }

    if (stars === '**' || stars === '***') {
      const relationshipNodeProps = memory.txn.schemaDataStructures.relationshipPropsMap.get(rootRelationship) // get node props that point to this relationship

      if (relationshipNodeProps) {
        for (const [ nodePropName, { propValue: nodePropValue } ] of relationshipNodeProps) {
          /** @type { td.AceSchemaNodeValue | undefined } */
          const nodeProps2 = memory.txn.schema.nodes[nodePropValue.options.node] // the props for the level 2 node

          updatedResValue[nodePropName] = { id: true, _id: true }

          if (relationshipProps1) { // IF there ae props for the root relationship THEN add props to level1 node prop resValue
            for (const relationshipPropName1 in relationshipProps1) {
              updatedResValue[nodePropName][relationshipPropName1] = true
            }
          }

          for (const propName2 in nodeProps2) {
            if (nodeProps2[propName2].is === 'Prop') updatedResValue[nodePropName][propName2] = true // IF the prop does not point to a node THEN add prop to resValue
            else if (stars === '***') { // IF prop points to a node THEN only continue if more levels requested
              /** @type { td.AceSchemaNodeValue | undefined } */
              const nodeProps3 = memory.txn.schema.nodes[/** @type {*} */ (nodeProps2[propName2].options).node] // the props for the level 3 node

              updatedResValue[nodePropName][propName2] = { id: true, _id: true }

              for (const propName3 in nodeProps3) { // IF the prop does not point to a node THEN add prop to resValue
                if (nodeProps3[propName3].is === 'Prop') updatedResValue[nodePropName][propName2][propName3] = true
              }

              const relationship3 = /** @type {td.AceSchemaNodeRelationshipOptions} */ (nodeProps3?.[propName2]?.options)?.relationship // the relationship name between the level 3 node and the leve 2 node

              if (relationship3) { // IF there are props, @ the relationship between the level 2 node and level 3 node THEN add each relationship prop to resValue
                const relationshipProps3 = memory.txn.schema.relationships[relationship3]?.props

                if (relationshipProps3) {
                  for (const relationshipPropName3 in relationshipProps3) {
                    updatedResValue[nodePropName][propName2][relationshipPropName3] = true
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return updatedResValue
}


/**
 * @param { td.AceQueryStars | td.AceQueryRequestItemNodeResValue} resValue
 * @returns { undefined | td.AceQueryStars }
 */
function getStars (resValue) {
  /** @type { undefined | td.AceQueryStars } */
  let stars

  if (typeof resValue === 'string') stars = resValue
  else if (typeof resValue?.$o?.fill === 'string') stars = resValue.$o.fill

  return stars
}


/**
 * @param { td.AceQueryRequestItemNodeResValue | td.AceQueryRequestItemRelationshipResValue } [ resValue ]
 * @returns { td.AceQueryRequestItemNodeResValue | td.AceQueryRequestItemRelationshipResValue | * }
 */
function updateWhereIds (resValue) {
  // find
  if (resValue?.$o?.findById) resValue.$o.findById = enumIdToGraphId({ id: resValue.$o.findById })
  if (resValue?.$o?.findBy_Id) resValue.$o.findBy_Id = enumIdToGraphId({ id: resValue.$o.findBy_Id })
  if (resValue?.$o?.findByPropValue) resValue.$o.findByPropValue[2] = enumIdToGraphId({ id: resValue.$o.findByPropValue[2] })

  // filter
  if (resValue?.$o?.filterByIds) resValue.$o.filterByIds = enumIdToGraphId({ ids: resValue.$o.filterByIds })
  if (resValue?.$o?.filterBy_Ids) resValue.$o.filterBy_Ids = enumIdToGraphId({ ids: resValue.$o.filterBy_Ids })
  if (resValue?.$o?.filterByPropValue) resValue.$o.filterByPropValue[2] = enumIdToGraphId({ id: resValue.$o.filterByPropValue[2] })

  // groups
  if (resValue?.$o?.findByOr) resValue.$o.findByOr = updateWhereGroupIds(resValue.$o.findByOr)
  if (resValue?.$o?.findByAnd) resValue.$o.findByAnd = updateWhereGroupIds(resValue.$o.findByAnd)
  if (resValue?.$o?.filterByOr) resValue.$o.filterByOr = updateWhereGroupIds(resValue.$o.filterByOr)
  if (resValue?.$o?.filterByAnd) resValue.$o.filterByAnd = updateWhereGroupIds(resValue.$o.filterByAnd)

  return resValue
}


/**
 * @param { td.AceQueryFilterGroup } group
 * @returns { td.AceQueryFilterGroup }
 */
function updateWhereGroupIds (group) {
  for (const groupItem of group) {
    if (Array.isArray(groupItem) && groupItem.length === 3 && typeof groupItem[2] === 'string') groupItem[2] = enumIdToGraphId({ id: groupItem[2] })
    else if (/** @type { td.AceQueryWhereOr } */ (groupItem).or) updateWhereGroupIds(/** @type { td.AceQueryWhereOr } */(groupItem).or)
    else if (/** @type { td.AceQueryWhereAnd } */ (groupItem).and) updateWhereGroupIds(/** @type { td.AceQueryWhereAnd } */(groupItem).and)
  }

  return group
}


/**
 * @param { td.AceQueryRequestItemNodeResValue | td.AceQueryRequestItemRelationshipResValue } [ resValue ]
 * @returns { Set<string> | null }
 */
function getResHide (resValue) {
  return resValue?.$o?.resHide ? new Set(resValue.$o.resHide) : null
}
