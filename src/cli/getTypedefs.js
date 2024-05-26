import { DELIMITER } from '../util/variables.js'
import { isObjectPopulated } from '../util/isObjectPopulated.js'


/**
 * @param { { nodes: any; relationships: any; } | null } schema
 * @returns { string }
 */
export function getTypedefs (schema) {
  const typedefs = getSchemaTypedefs(schema)

  return `import fs from 'node:fs'
import * as enums from './enums.js'


/**
 * @typedef { object } AceMemory
 * @prop { AceQueueItem[] } queue
 * @prop { AceTxn } txn
 * @prop { AceMemoryWal } wal
 *
 * @typedef { object } AceMemoryWal
 * @prop { AceMemoryMiniIndexItem[] } miniIndex
 * @prop { number } byteAmount
 * @prop { Map<string | number, { action: enums.writeActions, value: any }> } map
 * @prop { fs.promises.FileHandle } [ filehandle ]
 *
 * @typedef { [ string | number, number, number, number ] } AceMemoryMiniIndexItem
 */


${ typedefs.Nodes}${typedefs.Relationships }/** AceGraph
 *
 * @typedef { { node: string, props: AceGraphNodeProps, [ relationship: string ]: any | string[] } } AceGraphNode
 * @typedef { { id: (string | number), [propName: string]: any } } AceGraphNodeProps
 *
 * @typedef { object } AceGraphRelationship
 * @property { string } relationship
 * @property { AceGraphRelationshipProps } props
 * @typedef { { a: string, b: string, _id: string, [propName: string]: any } } AceGraphRelationshipProps
 */


/** AceError
 *
 * @typedef { { id: string, detail: string, [errorItemKey: string]: any} } AceError
 * @typedef { { node?: string, relationship?: string, prop?: string, schema?: boolean } } AceAuthErrorOptions
 */


/** AceQueue
 * 
 * @typedef { object } AceQueueItem
 * @property { (res: AceFnResponse) => void } resolve
 * @property { AcePromiseReject } reject
 * @property { AceFnOptions } options
 */


/** AceTxn
 * 
 * @typedef { object } AceTxn
 * @property { string } [ id ]
 * @property { NodeJS.Timeout } [ timeoutId ]
 * @property { enums.txnSteps } step
 * @property { AceSchema | null } schema
 * @property { AceTxnSchemaDataStructures } schemaDataStructures
 * @property { number } [ lastId ]
 * @property { boolean } hasUpdates
 * @property { boolean } wasEmptyRequested
 * @property { Map<string, number> } enumGraphIdsMap
 * @property { Map<string | number, { action: enums.writeActions, value: * }> } writeMap
 * @property { string } writeStr
 * @property { Map<string, { propName: string, newIds: (string | number)[] }> } sortIndexMap - If we add a node and prop and that node+prop has a sort index, put the newly created nodes in here
 * 
 * @typedef { object } AceTxnSchemaDataStructures
 * @property { Map<string, Set<string>> } cascade
 * @property { Map<string, Set<string>> } nodeRelationshipPropsMap
 * @property { Map<string, string> } nodeNamePlusRelationshipNameToNodePropNameMap
 * @property { Map<string, Map<string, { propNode: string, propValue: AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp }>> } relationshipPropsMap
 * @property { Map<string, Map<string, (AceSchemaProp | AceSchemaRelationshipProp | AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp)>> } mustPropsMap
 */


/** AceFn
 *
 * @typedef { object } AceFnOptions
 * @property { AceFnOptionsWhere } where - Path of graph file relative to your package.json file (aka your cwd)
 * @property { AceFnRequest } [ what ]
 * @property { AceFnOptionsTxn } [ txn ]
 * @property { AceFnStringJWKs } [ jwks ]
 *
 * @typedef { string } AceFnOptionsWhere
 *
 * @typedef { AceFnOptionsTxnStart | AceFnOptionsTxnComplete | AceFnOptionsTxnCancel | AceFnOptionsTxnContinue } AceFnOptionsTxn
 * 
 * @typedef { object } AceFnOptionsTxnStart
 * @property { typeof enums.txnActions.start } action
 * @property { never } [ id ]
 *
 * @typedef { object } AceFnOptionsTxnComplete
 * @property { typeof enums.txnActions.complete } action
 * @property { string } id
 *
 * @typedef { object } AceFnOptionsTxnCancel
 * @property { typeof enums.txnActions.cancel } action
 * @property { string } id
 *
 * @typedef { object } AceFnOptionsTxnContinue
 * @property { string } id
 * @property { never } [ action ]
 *
 * @typedef { object } AceFnRequestItemMemoryInitialize
 * @property { typeof enums.aceDo.MemoryInitialize } do
 *
 * @typedef { AceQueryRequestItem | AceMutateRequestItem | AceFnRequestItemMemoryInitialize } AceFnRequestItem
 * 
 * @typedef { AceFnRequestItem | (AceFnRequestItem)[] } AceFnRequest
 * @typedef { { [prop: string]: any, $ace?: AceFn$ } } AceFnResponse
 * @typedef { { now: AceFnResponse, original: { [k: string]: any } } } AceFnFullResponse
 * @typedef { { success: true } } AceFnEmptyResponse
 *
 * @typedef { { [name: string]: { type: 'private' | 'public' | 'crypt', jwk: string } } } AceFnStringJWKs
 * @typedef { { [name: string]: CryptoKey } } AceFnCryptoJWK
 * @typedef { { private: AceFnCryptoJWK, public: AceFnCryptoJWK, crypt: AceFnCryptoJWK } } AceFnCryptoJWKs
 *
 * @typedef { { txnId?: string, txnStarted?: boolean, txnCompleted?: boolean, txnCancelled?: boolean, enumIds?: { [id: string]: number }, deletedKeys?: (string | number)[] } } AceFn$
 *
 * @typedef { { nodes: any, relationships: any } } AceFnUpdateRequestItems - If updating we store the orignal items here, based on the id (nodes) or id (relationships)
 */


/** AceSchema
 *
 * @typedef { { nodes: { [nodeName: string]: AceSchemaNodeValue }, relationships?: { [relationshipName: string]: AceSchemaRelationshipValue } } } AceSchema
 * @typedef { { [nodePropName: string]: AceSchemaProp | AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp } } AceSchemaNodeValue
 *
 * @typedef { AceSchemaRelationshipValueOneToOne | AceSchemaRelationshipValueOneToMany | AceSchemaRelationshipValueManyToMany } AceSchemaRelationshipValue
 * 
 * @typedef { object } AceSchemaRelationshipValueOneToOne
 * @property { typeof enums.schemaIs.OneToOne  } is - This is a one to one relationship
 * @property { AceSchemaRelationshipProps  } [ props ]
 * 
 * @typedef { object } AceSchemaRelationshipValueOneToMany
 * @property { typeof enums.schemaIs.OneToMany  } is - This is a one to many relationship
 * @property { AceSchemaRelationshipProps  } [ props ]
 * 
 * @typedef { object } AceSchemaRelationshipValueManyToMany
 * @property { typeof enums.schemaIs.ManyToMany  } is - This is a many to many relationship
 * @property { AceSchemaRelationshipProps  } [ props ]
 *
 * @typedef { object } AceSchemaProp
 * @property { typeof enums.schemaIs.Prop  } is - This is a standard node prop
 * @property { AceSchemaPropOptions } options
 *
 * @typedef { object } AceSchemaRelationshipProp
 * @property { typeof enums.schemaIs.RelationshipProp } is - This is a relationship prop
 * @property { AceSchemaPropOptions } options
 *
 * @typedef { object } AceSchemaForwardRelationshipProp
 * @property { typeof enums.schemaIs.ForwardRelationshipProp } is - A **Forward** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
 * @property { AceSchemaNodeRelationshipOptions } options
 *
 * @typedef { object } AceSchemaReverseRelationshipProp
 * @property { typeof enums.schemaIs.ReverseRelationshipProp } is - A **Reverse** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
 * @property { AceSchemaNodeRelationshipOptions } options
 *
 * @typedef { object } AceSchemaBidirectionalRelationshipProp
 * @property { typeof enums.schemaIs.BidirectionalRelationshipProp } is - A **Bidirectional** node relationship prop. Meaning there is only one prop name and it represents both directions. For example if we a relationship name of **isFriendsWith**, the **friends** prop is the **Bidirectional** prop
 * @property { AceSchemaNodeRelationshipOptions } options
 *
 * @typedef { object } AceSchemaPropOptions
 * @property { enums.dataTypes } dataType - The data type for this property
 * @property { boolean } [ mustBeDefined ] - Must this schema prop be defined
 * @property { boolean } [ sortIndex ] - Should Ace maintain a sort index for this property. The index will be an array of all this node's id's in the order they are when all these node's are sorted by this property.
 * @property { boolean } [ uniqueIndex ] - Should Ace maintain a unique index for this property. This way you'll know no nodes in your graph have the same value for this property and a AceQueryFind will be faster if searching by this property.
 * @property { string } [ description ] - Custom description that Ace will add to other types, example: query / mutation types
 *
 * @typedef { object } AceSchemaNodeRelationshipOptions
 * @property { enums.schemaHas } has - Does this node have a max of **one** of these props or a max of **many**
 * @property { string } node - The node name that this prop points to
 * @property { string } relationship - Each node prop that is a relationship must also align with a relationship name. This way the relationship can have its own props.
 * @property { boolean } [ mustBeDefined ] - Must each node in the graph, that aligns with this relationship, have this relationship defined
 * @property { string } [ description ] - Custom description that Ace will add to other types, example: query / mutation types
 * @property { boolean } [ cascade ] - When this schema.node is deleted, also delete the node that this prop points to
 *
 * @typedef { { [propName: string]: AceSchemaRelationshipProp } } AceSchemaRelationshipProps - Props for this relationship
 * 
 * @typedef { object } AceSchemaDirectionsMapDirection
 * @property { string } nodeName
 * @property { string } nodePropName
 * @property { typeof enums.schemaIs.ForwardRelationshipProp | typeof enums.schemaIs.ReverseRelationshipProp | typeof enums.schemaIs.BidirectionalRelationshipProp } id
 */


/** AceMutate
 *
 * @typedef { AceMutateRequestItemEmpty | AceMutateRequestItemBackupLoad | AceMutateRequestItemSchema | AceMutateRequestItemNode | AceMutateRequestItemRelationship } AceMutateRequestItem
 * @typedef { AceMutateRequestItemSchemaAdd | AceMutateRequestItemSchemaUpdateNodeName | AceMutateRequestItemSchemaUpdateNodePropName | AceMutateRequestItemSchemaUpdateRelationshipName | AceMutateRequestItemSchemaUpdateRelationshipPropName | AceMutateRequestItemNodeDeleteDataAndDeleteFromSchema | AceMutateRequestItemNodePropDeleteDataAndDeleteFromSchema } AceMutateRequestItemSchema
 * @typedef { AceMutateRequestItemNodeInsert | AceMutateRequestItemNodeUpdate | AceMutateRequestItemNodeUpsert | AceMutateRequestItemNodeDeleteData | AceMutateRequestItemNodePropDeleteData | AceMutateRequestItemNodeDeleteDataAndDeleteFromSchema | AceMutateRequestItemNodePropDeleteDataAndDeleteFromSchema } AceMutateRequestItemNode
 * @typedef { AceMutateRequestItemRelationshipInsert | AceMutateRequestItemRelationshipUpdate | AceMutateRequestItemRelationshipUpsert | AceMutateRequestItemRelationshipDeleteData | AceMutateRequestItemRelationshipPropDeleteData } AceMutateRequestItemRelationship
 *
 * @typedef { object } AceMutateRequestItemBackupLoad
 * @property { typeof enums.aceDo.BackupLoad } do
 * @property { AceMutateRequestItemBackupLoadHow } how
 * @typedef { object } AceMutateRequestItemBackupLoadHow
 * @property { string } backup
 * @property { boolean } [ skipDataDelete ]
 *
 * @typedef { object } AceMutateRequestItemEmpty
 * @property { typeof enums.aceDo.Empty } do - Delete schema and all datamfrom graph${ typedefs.mutate.NodeInsertType }${ typedefs.mutate.RelationshipInsertType }${ typedefs.mutate.NodeUpdateType }${ typedefs.mutate.RelationshipUpdateType }${ typedefs.mutate.NodeUpsertType }${ typedefs.mutate.RelationshipUpsertType }
 * 
 * @typedef { AceMutateRequestItemRelationshipInsert | AceMutateRequestItemRelationshipUpdate | AceMutateRequestItemRelationshipUpsert } AceMutateRequestItemRelationshipInup
 * 
 * @typedef { AceMutateRequestItemNodeUpdate & { [relationshipProp: string]: string[] } } AceMutateRequestItemNodeWithRelationships
 * 
 * @typedef { object } AceMutateRequestItemNodeDeleteData
 * @property { typeof enums.aceDo.NodeDeleteData } do
 * @property { (string | number)[] } how - The ids you'd love deleted. To cascade delete, add cascade to your schema
 *
 * @typedef { object } AceMutateRequestItemRelationshipDeleteData
 * @property { typeof enums.aceDo.RelationshipDeleteData } do
 * @property { { _ids: (string | number)[] } } how
 *
 * @typedef { object } AceMutateRequestItemNodePropDeleteData
 * @property { typeof enums.aceDo.NodePropDeleteData } do
 * @property { { ids: (string | number)[], props: string[] } } how
 *
 * @typedef { object } AceMutateRequestItemRelationshipPropDeleteData
 * @property { typeof enums.aceDo.RelationshipPropDeleteData } do
 * @property { { _ids: (string | number)[], props: string[] } } how
 *
 * @typedef { ${ typedefs.mutate.NodeDeleteDataAndDeleteFromSchemaType || 'string' } } AceMutateRequestItemNodeDeleteDataAndDeleteFromSchemaNode
 * 
 * @typedef { object } AceMutateRequestItemNodeDeleteDataAndDeleteFromSchema
 * @property { typeof enums.aceDo.NodeDeleteDataAndDeleteFromSchema } do
 * @property { AceMutateRequestItemNodeDeleteDataAndDeleteFromSchemaHow } how
 * @typedef { object } AceMutateRequestItemNodeDeleteDataAndDeleteFromSchemaHow
 * @property { AceMutateRequestItemNodeDeleteDataAndDeleteFromSchemaNode[] } nodes
 *
 * @typedef { object } AceMutateRequestItemNodePropDeleteDataAndDeleteFromSchema
 * @property { typeof enums.aceDo.NodePropDeleteDataAndDeleteFromSchema } do
 * @property { AceMutateRequestItemNodePropDeleteDataAndDeleteFromSchemaHow } how
 * @typedef { object } AceMutateRequestItemNodePropDeleteDataAndDeleteFromSchemaHow
 * @property { ${ typedefs.mutate.NodePropDeleteDataAndDeleteFromSchemaType || '{ node: string, prop: string }[]' } } props
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodeName
 * @property { typeof enums.aceDo.SchemaUpdateNodeName } do
 * @property { AceMutateRequestItemSchemaUpdateNodeNameHow } how
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodeNameHow
 * @property { ${ typedefs.mutate.SchemaUpdateNodeNameType || '{ nowName: string, newName: string }[]' } } nodes
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodePropName
 * @property { typeof enums.aceDo.SchemaUpdateNodePropName } do
 * @property { AceMutateRequestItemSchemaUpdateNodePropNameHow } how
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodePropNameHow
 * @property { ${ typedefs.mutate.SchemaUpdateNodePropNameType || '{ node: string, nowName: string, newName: string }[]' } } props
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateRelationshipName
 * @property { typeof enums.aceDo.SchemaUpdateRelationshipName } do
 * @property { AceMutateRequestItemSchemaUpdateRelationshipNameHow } how
 * @typedef { object } AceMutateRequestItemSchemaUpdateRelationshipNameHow
 * @property { ${ typedefs.mutate.SchemaUpdateRelationshipNameType || '{ nowName: string, newName: string }[]' } } relationships
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateRelationshipPropName
 * @property { typeof enums.aceDo.SchemaUpdateRelationshipPropName } do
 * @property { AceMutateRequestItemSchemaUpdateRelationshipPropNameHow } how
 * @typedef { object } AceMutateRequestItemSchemaUpdateRelationshipPropNameHow
 * @property { ${ typedefs.mutate.SchemaUpdateRelationshipPropNameType || '{ relationship: string, nowName: string, newName: string }[]' } } props
 *
 * @typedef { object } AceMutateRequestItemSchemaAdd
 * @property { typeof enums.aceDo.SchemaAdd } do
 * @property { AceSchema } how
 *
 * @typedef { object } AceMutateRequestOptions
 * @property { string } [ privateJWK ]
 *
 * @typedef { ${ typedefs.mutate.RelationshipInUpProps || 'AceMutateRequestItemRelationshipInsertProps | AceMutateRequestItemRelationshipUpdateProps | AceMutateRequestItemRelationshipUpsertProps' } } AceMutateRequestItemRelationshipInUpProps
 */${ typedefs.mutate.NodeInsertTypes }${ typedefs.mutate.RelationshipInsertTypes }${ typedefs.mutate.NodeUpdateTypes }${ typedefs.mutate.RelationshipUpdateTypes }${ typedefs.mutate.NodeUpsertTypes }${ typedefs.mutate.RelationshipUpsertTypes }


/** AceQuery
 * 
${ typedefs.query.NodeType }
 *
${ typedefs.query.RelationshipType }
 *
 * @typedef { AceQueryRequestItemNode | AceQueryRequestItemRelationship | AceQueryRequestItemBackupGet | AceQueryRequestItemSchemaGet } AceQueryRequestItem
 *
 * @typedef { boolean | { alias: string } } AceQueryResValuePropValue
 * 
 * @typedef { '*' | '**' | '***' } AceQueryStars
 * 
 * @typedef { Set<string> | null } AceQueryResHide
 * 
 * @typedef { object } AceQueryRequestItemDetailedResValueSection
 * @property { string } reqResKey
 * @property { string } resKey
 * @property { string } [ aliasResKey ]
 * @property { enums.schemaHas } schemaHas
 * @property { 'NodeQuery' | 'RelationshipQuery' } do
 * @property { AceQueryRequestItemDetailedResValueSection } [ parent ]
 * @property { string } [ node ]
 * @property { string } [ relationship ]
 * @property { AceQueryRequestItemNodeResValue } resValue
 * @property { Set<string> | null } resHide
 * 
 * @typedef { object } AceQueyWhereGetValueResponse
 * @property { any } value
 * @property { 'value' | 'prop' } is
 * @property { null | AceQueryRequestItemDetailedResValueSection } detailedResValueSection
 *
 * @typedef { { node?: any, relationship?: any, id?: string } } AceQueryAddPropsItem
 * 
 * @typedef { { [propertyName: string]: any,   id?: AceQueryResValuePropValue,   $o?: AceQueryRequestItemNodeOptions } } AceQueryRequestItemNodeResValue
 * @typedef { { [propertyName: string]: any,   _id?: AceQueryResValuePropValue,  $o?: AceQueryRequestItemNodeOptions } } AceQueryRequestItemRelationshipResValue
 * 
 * @typedef { object } AceQueryRequestItemNodeOptions
 * @property { enums.queryOptions[] } [ flow ]
 * @property { string } [ alias ]
 * @property { AceQueryStars } [ fill ]
 * @property { AceQuerySort } [ sort ]
 * @property { string | number } [ findById ]
 * @property { string | number } [ findBy_Id ]
 * @property { AceQueryFindByUnique } [ findByUnique ]
 * @property { (string | number)[] } [ filterByIds ]
 * @property { (string | number)[] } [ filterBy_Ids ]
 * @property { AceQueryFilterByUniques } [ filterByUniques ]
 * @property { AceQueryRequestItemPublicJWKOption } [ publicJWKs ]
 * @property { string } [ countAsProp ] - Find the count for the number of items in the response and then add this value as this **prop** to each node in the response
 * @property { AceQuerySumAsProp } [ sumAsProp ]
 * @property { AceQueryAverageAsProp } [ avgAsProp ]
 * @property { AceQueryMinAmountAsProp } [ minAmtAsProp ]
 * @property { AceQueryMaxAmountAsProp } [ maxAmtAsProp ]
 * @property { AceQueryNewPropsProp } [ newProps ]
 * @property { AceQueryPropAdjacentToResponse } [ propAdjToRes ]
 * @property { AceQueryFindGroup } [ findByOr ]
 * @property { AceQueryFindGroup } [ findByAnd ]
 * @property { AceQueryWherePropValue } [ findByPropValue ]
 * @property { AceQueryWherePropProp } [ findByPropProp ]
 * @property { AceQueryWherePropRes } [ findByPropRes ]
 * @property { string } [ findByDefined ]
 * @property { string } [ findByUndefined ]
 * @property { AceQueryFilterGroup } [ filterByOr ]
 * @property { AceQueryFilterGroup } [ filterByAnd ]
 * @property { string } [ filterByDefined ]
 * @property { string } [ filterByUndefined ]
 * @property { AceQueryWherePropValue } [ filterByPropValue ]
 * @property { AceQueryWherePropProp } [ filterByPropProp ]
 * @property { AceQueryWherePropRes } [ filterByPropRes ]
 * @property { AceQueryLimit } [ limit ]
 * @property { string } [ countAdjToRes ] - Prop name that will be adjacent to this array in the response and hold the length of this array in the response
 * @property { string[] } [ resHide ] - Array of props you'd love to hide in the response
 * @property { AceQueryPropAsResponse } [ propAsRes ]
 * @property { boolean } [ countAsRes ] - Display the count of results as the response
 * @property { string } [ sumAsRes ] - Loop the items in the response, calculate the sum of this property, amongst all response items and set it as the response
 * @property { string } [ avgAsRes ] - Loop the items in the response, calculate the average of this property, amongst all response items and set it as the response
 * @property { string } [ minAmtAsRes ] - Loop the items in the response, find the min amount of this property, amongst all response items and set it as the response
 * @property { string } [ maxAmtAsRes ] - Loop the items in the response, find the max amount of this property, amongst all response items and set it as the response
 * @property { string } [ minNodeAsRes ] - Find the smallest numerical value of each node's **property** in the response and then set the node that has that value as the response
 * @property { string } [ maxNodeAsRes ] - Find the largest numerical value of each node's **property** in the response and then set the node that has that value as the response
 * 
 * @typedef { object } AceQueryRequestItemRelationshipOptions
 * @property { enums.queryOptions[] } [ flow ]
 * @property { string } [ alias ]
 * @property { boolean } [ all ]
 * @property { AceQuerySort } [ sort ]
 * @property { string } [ findBy_Id ]
 * @property { string[] } [ filterBy_Ids ]
 * @property { AceQueryRequestItemPublicJWKOption } [ publicJWKs ]
 * @property { string } [ countAsProp ] - Find the count for the number of items in the response and then add this value as this **prop** to each node in the response
 * @property { AceQuerySumAsProp } [ sumAsProp ]
 * @property { AceQueryAverageAsProp } [ avgAsProp ]
 * @property { AceQueryMinAmountAsProp } [ minAmtAsProp ]
 * @property { AceQueryMaxAmountAsProp } [ maxAmtAsProp ]
 * @property { AceQueryNewPropsProp } [ newProps ]
 * @property { AceQueryPropAdjacentToResponse } [ propAdjToRes ]
 * @property { AceQueryFindGroup } [ findByOr ]
 * @property { AceQueryFindGroup } [ findByAnd ]
 * @property { string } [ findByDefined ]
 * @property { string } [ findByUndefined ]
 * @property { AceQueryWherePropValue } [ findByPropValue ]
 * @property { AceQueryWherePropProp } [ findByPropProp ]
 * @property { AceQueryWherePropRes } [ findByPropRes ]
 * @property { AceQueryFilterGroup } [ filterByOr ]
 * @property { AceQueryFilterGroup } [ filterByAnd ]
 * @property { string } [ filterByDefined ]
 * @property { string } [ filterByUndefined ]
 * @property { AceQueryWherePropValue } [ filterByPropValue ]
 * @property { AceQueryWherePropProp } [ filterByPropProp ]
 * @property { AceQueryWherePropRes } [ filterByPropRes ]
 * @property { AceQueryLimit } [ limit ]
 * @property { string } [ countAdjToRes ] - Prop name that will be adjacent to this array in the response and hold the length of this array in the response
 * @property { string[] } [ resHide ] - Array of props you'd love to hide in the response
 * @property { AceQueryPropAsResponse } [ propAsRes ]
 * @property { boolean } [ countAsRes ] - Display the count of results as the response
 * @property { string } [ sumAsRes ] - Loop the items in the response, calculate the sum of this property, amongst all response items and set it as the response
 * @property { string } [ avgAsRes ] - Loop the items in the response, calculate the average of this property, amongst all response items and set it as the response
 * @property { string } [ minAmtAsRes ] - Loop the items in the response, find the min amount of this property, amongst all response items and set it as the response
 * @property { string } [ maxAmtAsRes ] - Loop the items in the response, find the max amount of this property, amongst all response items and set it as the response
 * @property { string } [ minNodeAsRes ] - Find the smallest numerical value of each node's **property** in the response and then set the node that has that value as the response
 * @property { string } [ maxNodeAsRes ] - Find the largest numerical value of each node's **property** in the response and then set the node that has that value as the response
 *
 * @typedef { object } AceQueryRequestItemPublicJWKOption
 * @property { string } [ findByOr ]
 * @property { string } [ findByAnd ]
 * @property { string } [ findByPropValue ]
 * @property { string } [ findByPropRes ]
 * @property { string } [ filterByOr ]
 * @property { string } [ filterByAnd ]
 * @property { string } [ filterByPropValue ]
 * @property { string } [ filterByPropRes ]
 *
 * @typedef { object } AceQueryWhereItemProp
 * @property { string } prop
 * @property { string[] } [ relationships ]
 *
 * @typedef { * } AceQueryWhereItemValue
 * @typedef { object } AceQueryWhereItemRes - An array from response, so if you'd love to point to response.abc.xyz[10].yay this value would be [ 'abc', 'xyz', 10, 'yay' ]
 * @property { any[] } res - An array from response, so if you'd love to point to response.abc.xyz[10].yay this value would be [ 'abc', 'xyz', 10, 'yay' ]
 *
 * @typedef { { or: AceQueryFindGroup } } AceQueryWhereOr
 * @typedef { { and: AceQueryFindGroup } } AceQueryWhereAnd
 * @typedef { { isPropDefined: string } } AceQueryWhereDefined
 * @typedef { { isPropUndefined: string } } AceQueryWhereUndefined
 * @typedef { [ AceQueryWhereItemProp, enums.queryWhereSymbol, AceQueryWhereItemProp ] } AceQueryWherePropProp
 * @typedef { [ AceQueryWhereItemProp, enums.queryWhereSymbol, AceQueryWhereItemValue ] } AceQueryWherePropValue
 * @typedef { [ AceQueryWhereItemProp, enums.queryWhereSymbol, AceQueryWhereItemRes ] } AceQueryWherePropRes
 * @typedef { (AceQueryWherePropValue | AceQueryWherePropProp | AceQueryWherePropRes | AceQueryWhereDefined | AceQueryWhereUndefined | AceQueryWhereOr | AceQueryWhereAnd)[] } AceQueryFindGroup
 * @typedef { (AceQueryWherePropValue | AceQueryWherePropProp | AceQueryWherePropRes | AceQueryWhereDefined | AceQueryWhereUndefined | AceQueryWhereOr | AceQueryWhereAnd)[] } AceQueryFilterGroup
 *
 * @typedef { object } AceQueryFilterByUniques
 * @property { AceQueryFilterByUniquesItem[] } uniques - With this array of unique values, returns an array of valid nodes (valid meaning: found in graph via unique index & $o qualifiying)
 * @typedef { object } AceQueryFilterByUniquesItem
 * @property { string } value - The value Ace will query to find a unique match for
 * @property { string } prop - Find node by this prop that has a unique index
 *
 * @typedef { object } AceQueryFindByUnique
 * @property { string } value - The value Ace will query to find a unique match for
 * @property { string } prop - Find node by this prop that has a unique index
 *
 * @typedef { object } AceQueryRequestItemSchemaGet
 * @property { typeof enums.aceDo.SchemaGet } do
 * @property { string } how - Response key
 *
 * @typedef { object } AceQueryRequestItemBackupGet
 * @property { typeof enums.aceDo.BackupGet } do
 * @property { string } how - Response key
 * 
 * @typedef { object } AceQueryValue
 * @property { any } value
 *
 * @typedef { object } AceQuerySort
 * @property { enums.sortHow } how
 * @property { string } prop
 * 
 * @typedef { object } AceQueryLimit
 * @property { number } [ skip ]
 * @property { number } [ count ]
 *
 * @typedef { object } AceQueryProp
 * @property { string } prop - String property name
 * @property { string[] } [ relationships ] - If this property is not on the node, list the relationship properties to get to the desired nodes
 *
 * @typedef { object } AceQuerySumAsProp
 * @property { string } computeProp - Add the sum of the **computeProp** of each node in the response
 * @property { string } newProp - Add the sum of the **computeProp** of each node in the response and add this value as the **newProp** to each node in the response
 *
 * @typedef { object } AceQueryPropAsResponse
 * @property { string } prop - String that is the prop name that you would love to show as the response
 * @property { string[] } [ relationships ] - Array of strings (node relationship prop names) that takes us, from the node we are starting on, to the desired node, with the property you'd love to source. The relationship must be defined in the query to find any properties of the relationship. So if I am starting @ User and I'd love to get to User.role.enum, the relationships will be **[ 'role' ]**, property is **'enum'** and in the query I've got **{ x: { role: { id: true } } }**
 *
 * @typedef { object } AceQueryPropAdjacentToResponse
 * @property { string } sourceProp
 * @property { string } adjacentProp
 * @property { string[] } [ relationships ] - Array of strings (node relationship prop names) that takes us, from the node we are starting on, to the desired node, with the property you'd love to see, as the response. The relationship must be defined in the query to find any properties of the relationship. So if I am starting @ User and I'd love to get to User.role.enum, the relationships will be **[ 'role' ]**, property is **'enum'** and in the query I've got **{ x: { role: { id: true } } }**
 *
 * @typedef { object } AceQueryAverageAsProp
 * @property { string } computeProp - Add the sum of the **computeProp** of each node in the response and then divide by the count of items in the response
 * @property { string } newProp - Add the sum of the **computeProp** of each node in the response and then divide by the count of items in the response and add this value as the **newProp** to each node in the response
 *
 * @typedef { object } AceQueryMinAmountAsProp
 * @property { string } computeProp - Find the smallest numerical value of each node's **computeProp** in the response
 * @property { string } newProp - Find the smallest numerical value of each node's **computeProp** in the response and then add this value as the **newProp** to each node in the response
 *
 * @typedef { object } AceQueryMaxAmountAsProp
 * @property { string } computeProp - Find the largest numerical value of each node's **computeProp** in the response
 * @property { string } newProp - Find the largest numerical value of each node's **computeProp** in the response and then add this value as the **newProp** to each node in the response
 *
 * @typedef { { [propName: string]: AceQueryNewPropsGroup } } AceQueryNewPropsProp
 * @typedef { { add: AceQueryNewPropsGroupItem[], subtract?: never, multiply?: never, divide?: never } | { subtract: AceQueryNewPropsGroupItem[], add?: never, multiply?: never, divide?: never } | { multiply: AceQueryNewPropsGroupItem[], add?: never, subtract?: never, divide?: never } | { divide: AceQueryNewPropsGroupItem[], add?: never, subtract?: never, multiply?: never } } AceQueryNewPropsGroup
 * @typedef { number | string | AceQueryProp | AceQueryNewPropsGroup } AceQueryNewPropsGroupItem
*/${ typedefs.query.Nodes } ${ typedefs.query.Relationships } ${ typedefs.query.RelationshipPropTypes }


/** AceBackup
 *
 * @typedef { { [k: string]: any }  } AceBackupResponse
 */


/** AcePromise
 * 
 * @typedef { (reason?: any) => void  } AcePromiseReject
 */
`
}


/**
 * @param { { nodes: any; relationships: any; } | null } schema
 */
function getSchemaTypedefs (schema) {
  /** @type { Map<string, { schemaNodeName: string, schemaNodePropName: string, schemaProp: any }[]> }> } <relationshipName, ({ schemaNodeName, schemaNodePropName: string, schemaProp: AceSchemaBidirectionalRelationshipProp } | { schemaNodePropName: string, schemaProp: AceSchemaForwardRelationshipProp } | { schemaNodePropName: string, schemaProp: SchemaReverseRelationshipPro }p)[]> */
  const relationshipMap = new Map()

  const typedefs = {
    Nodes: '',
    Relationships: '',
    query: {
      Nodes: '',
      NodeType: '',
      NodeProps: '',
      NodePipes: '',
      Relationships: '',
      RelationshipType: '',
      RelationshipProps: '',
      RelationshipPipes: '',
      RelationshipPropTypes: '',
    },
    mutate: {
      NodeInsertType: '',
      NodeUpdateType: '',
      NodeUpsertType: '',
      NodeInsertPipes: '',
      NodeUpdatePipes: '',
      NodeUpsertPipes: '',
      NodeInsertTypes: '',
      NodeUpdateTypes: '',
      NodeUpsertTypes: '',
      RelationshipInUpProps: '',
      RelationshipInsertType: '',
      RelationshipUpdateType: '',
      RelationshipUpsertType: '',
      RelationshipInsertPipes: '',
      RelationshipUpdatePipes: '',
      RelationshipUpsertPipes: '',
      RelationshipInsertTypes: '',
      RelationshipUpdateTypes: '',
      RelationshipUpsertTypes: '',
      NodeDeleteDataAndDeleteFromSchemaType: '',
      NodePropDeleteDataAndDeleteFromSchemaType: '',
      SchemaUpdateNodeNameType: '',
      SchemaUpdateNodePropNameType: '',
      SchemaUpdateRelationshipNameType: '',
      SchemaUpdateRelationshipPropNameType: '',
    }
  }


  if (isObjectPopulated(schema?.nodes)) {
    typedefs.Nodes += '/** Nodes: (from schema)'
    typedefs.mutate.NodeInsertTypes += '\n\n\n/** Mutate: Insert node (from schema)'
    typedefs.mutate.NodeUpdateTypes += '\n\n\n/** Mutate: Update node (from schema)'
    typedefs.mutate.NodeUpsertTypes += '\n\n\n/** Mutate: Upsert node (from schema)'

    for (const schemaNodeName in schema?.nodes) {
      typedefs.query.NodeProps = '' // reset props from previous loop
      typedefs.Nodes += `\n * @typedef { object } ${ schemaNodeName }\n * @property { string } [ id ]`
      typedefs.query.NodePipes += `${ schemaNodeName }QueryRequestItemNode | `
      typedefs.mutate.NodeInsertPipes += `${ schemaNodeName }MutateRequestItemNodeInsert | `
      typedefs.mutate.NodeUpdatePipes += `${ schemaNodeName }MutateRequestItemNodeUpdate | `
      typedefs.mutate.NodeUpsertPipes += `${ schemaNodeName }MutateRequestItemNodeUpsert | `
      typedefs.mutate.NodeUpsertPipes += `${ schemaNodeName }MutateRequestItemNodeUpsert | `
      typedefs.mutate.SchemaUpdateNodeNameType += `{ nowName: '${ schemaNodeName }', newName: string } | `

      typedefs.mutate.NodeInsertTypes += `\n *
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeInsert
 * @property { typeof enums.aceDo.NodeInsert } do - Insert Node
 * @property { ${ schemaNodeName }MutateRequestItemNodeInsertHow } how
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeInsertHow
 * @property { '${ schemaNodeName }' } node - Insert **${ schemaNodeName }** node
 * @property { ${ schemaNodeName }MutateRequestItemInsertProps } props
 * @typedef { object } ${ schemaNodeName }MutateRequestItemInsertProps
 * @property { AceMutateRequestOptions } [ $o ] - Mutation insert options
 * @property { string | number } [ id ] - If you are setting your own **id**, it must be a unique **id** to all other relationships or nodes in your graph. If you are allowing Ace to set this id, it must look like this **_:chris** - The beginning must have the id prefix which is **_:** and the end must have a unique identifier string, this way you can reuse this id in other mutations`

      typedefs.mutate.NodeUpdateTypes += `\n *
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeUpdate
 * @property { typeof enums.aceDo.NodeUpdate } do - Update Node
 * @property { ${ schemaNodeName }MutateRequestItemNodeUpdateHow } how
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeUpdateHow
 * @property { '${ schemaNodeName }' } node - Update **${ schemaNodeName }** node
 * @property { ${ schemaNodeName }MutateRequestUpdateItemProps } props
 * @typedef { object } ${ schemaNodeName }MutateRequestUpdateItemProps
 * @property { AceMutateRequestOptions } [ $o ] - Mutation update options
 * @property { string | number } id - The node's unique identifier`

      typedefs.mutate.NodeUpsertTypes += `\n *
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeUpsert
 * @property { typeof enums.aceDo.NodeUpsert } do - Upsert Node
 * @property { ${ schemaNodeName }MutateRequestItemNodeUpsertHow } how
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeUpsertHow
 * @property { '${ schemaNodeName }' } node - Upsert **${ schemaNodeName }** node
 * @property { ${ schemaNodeName }MutateRequestUpsertItemProps } props
 * @typedef { object } ${ schemaNodeName }MutateRequestUpsertItemProps
 * @property { AceMutateRequestOptions } [ $o ] - Mutation upsert options
 * @property { string | number } id - The node's unique identifier`

      for (const schemaNodePropName in schema.nodes[schemaNodeName]) {
        const schemaProp = schema.nodes[schemaNodeName][schemaNodePropName]

        typedefs.mutate.NodePropDeleteDataAndDeleteFromSchemaType += `{ node: '${ schemaNodeName }', prop: '${ schemaNodePropName }' } | `
        typedefs.mutate.SchemaUpdateNodePropNameType += `{ node: '${ schemaNodeName }', nowName: '${ schemaNodePropName }', newName: string } | `

        switch (schemaProp.is) {
          case 'Prop':
            const dataType = getDataType(schemaProp.options.dataType)
            typedefs.Nodes += `\n * @property { ${ dataType } } [ ${ schemaNodePropName } ] ${ schemaProp.options.description || '' }`
            typedefs.mutate.NodeInsertTypes += `\n * @property { ${ dataType } } ${ schemaProp.options.mustBeDefined ? schemaNodePropName : '[ ' + schemaNodePropName + ' ]'} - Set to a value with a **${ dataType }** data type to set the current **${ schemaNodePropName }** property in the graph for this node (**${ schemaNodeName }**). ${ schemaProp.options.description || '' }`
            typedefs.mutate.NodeUpdateTypes += `\n * @property { ${ dataType } } [ ${ schemaNodePropName } ] - Set to a value with a **${ dataType }** data type to update the current **${ schemaNodePropName }** property in the graph for this node (**${ schemaNodeName }**). ${ schemaProp.options.description || '' }`
            typedefs.mutate.NodeUpsertTypes += `\n * @property { ${ dataType } } [ ${ schemaNodePropName } ] - Set to a value with a **${ dataType }** data type to upsert the current **${ schemaNodePropName }** property in the graph for this node (**${ schemaNodeName }**). ${ schemaProp.options.description || '' }`
            typedefs.query.NodeProps += `\n * @property { AceQueryResValuePropValue } [ ${ schemaNodePropName } ] - ${ getQueryPropDescription({ propName: schemaNodePropName, nodeName: schemaNodeName, schemaPropDescription: schemaProp.options.description }) }`
            break
          case 'ForwardRelationshipProp':
          case 'ReverseRelationshipProp':
          case 'BidirectionalRelationshipProp':
            const relationshipMapValue = relationshipMap.get(schemaProp.options.relationship) || []

            relationshipMapValue.push({ schemaNodeName, schemaNodePropName, schemaProp })
            relationshipMap.set(schemaProp.options.relationship, relationshipMapValue)

            typedefs.Nodes += `\n * @property { ${ schemaProp.options.node }${ schemaProp.options.has === 'many' ? '[]' : '' } } [ ${ schemaNodePropName } ]`

            let queryProps = ''

            for (const relationshipNodePropName in schema.nodes[schemaProp.options.node]) {
              const rSchemaProp = schema.nodes[schemaProp.options.node][relationshipNodePropName]

              queryProps += rSchemaProp.is === 'Prop' ?
                `\n * @property { AceQueryResValuePropValue } [ ${ relationshipNodePropName } ] - ${ getQueryPropDescription({ propName: relationshipNodePropName, nodeName: schemaProp.options.node, schemaPropDescription: rSchemaProp.options.description }) }` :
                `\n * @property { AceQueryStars | ${ getNodePropResValue(schemaProp.options.node, relationshipNodePropName) } } [ ${ relationshipNodePropName} ] - ${ getRelationshipQueryPropDescription(schemaProp.options.node, relationshipNodePropName, rSchemaProp) }`
            }

            if (schema.relationships?.[schemaProp.options.relationship]?.props) {
              const props = schema.relationships?.[schemaProp.options.relationship].props

              for (const relationshipPropName in props) {
                queryProps += `\n * @property { AceQueryResValuePropValue } [ ${ relationshipPropName} ] - ${getQueryPropDescription({ propName: relationshipPropName, relationshipName: schemaProp.options.relationship, schemaPropDescription: props[relationshipPropName].options.description })}`
              }
            }

            const relationshipPropName = getNodePropResValue(schemaNodeName, schemaNodePropName)

            typedefs.query.NodeProps += `\n * @property { AceQueryStars | ${ relationshipPropName } } [ ${ schemaNodePropName } ] - ${ getRelationshipQueryPropDescription(schemaNodeName, schemaNodePropName, schemaProp) }`

            if (!typedefs.query.RelationshipPropTypes) typedefs.query.RelationshipPropTypes += '\n\n\n/** Query: Node relationship props (from schema)\n *'

            typedefs.query.RelationshipPropTypes += `
 * @typedef { object } ${ relationshipPropName }
 * @property { AceQueryRequestItemNodeOptions } [ $o ]
 * @property { AceQueryResValuePropValue } [ _id ] - ${ getQueryPropDescription({ propName: '_id', relationshipName: schemaProp.options.relationship })}
 * @property { AceQueryResValuePropValue } [ id ] - ${ getQueryPropDescription({ propName: 'id', nodeName: schemaProp.options.node })}${ queryProps }
 *`
            break
        }
      }

      if (!typedefs.query.Nodes) typedefs.query.Nodes += `\n\n\n/** Query: Node's (from schema)\n`

      typedefs.query.Nodes +=` *
 * @typedef { object } ${ schemaNodeName }QueryRequestItemNode
 * @property { typeof enums.aceDo.NodeQuery } do
 * @property { ${ schemaNodeName }QueryRequestItemNodeHow } how
 * @typedef { object } ${ schemaNodeName }QueryRequestItemNodeHow
 * @property { '${ schemaNodeName }' } node
 * @property { string } resKey
 * @property { AceQueryStars | ${ schemaNodeName }QueryRequestItemNodeResValue } resValue
 * @typedef { object } ${ schemaNodeName }QueryRequestItemNodeResValue
 * @property { AceQueryResValuePropValue } [ id ]
 * @property { AceQueryRequestItemNodeOptions } [ $o ]${ typedefs.query.NodeProps }
`

      typedefs.Nodes += '\n *'
    }
  }


  if (isObjectPopulated(schema?.relationships)) {
    typedefs.Relationships += '/** Relationships: (from schema)'
    typedefs.mutate.RelationshipInsertTypes += '\n\n\n/** Mutate: Insert Relationships (from schema):'
    typedefs.mutate.RelationshipUpdateTypes += '\n\n\n/** Mutate: Update Relationships (from schema):'
    typedefs.mutate.RelationshipUpsertTypes += '\n\n\n/** Mutate: Update Relationships (from schema):'

    for (const schemaRelationshipName in schema?.relationships) {
      typedefs.query.RelationshipProps = '' // reset props from previous loop
      typedefs.Relationships += `\n * @typedef { object } ${ schemaRelationshipName }\n * @property { string } [ id ]`
      typedefs.query.RelationshipPipes += `${ schemaRelationshipName }QueryRequestItemRelationship | `
      typedefs.mutate.RelationshipInsertPipes += `${ schemaRelationshipName }MutateRequestItemRelationshipInsert | `
      typedefs.mutate.RelationshipUpdatePipes += `${ schemaRelationshipName }MutateRequestItemRelationshipUpdate | `
      typedefs.mutate.RelationshipUpsertPipes += `${ schemaRelationshipName }MutateRequestItemRelationshipUpsert | `
      typedefs.mutate.SchemaUpdateRelationshipNameType += `{ nowName: '${ schemaRelationshipName }', newName: string } | `
      typedefs.mutate.RelationshipInUpProps += `${ schemaRelationshipName }MutateRequestItemRelationshipInsertProps | ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateProps | ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertProps | `

      const abDescription = `**a** and **b** are node ids, so for examle if **a** is **_:node1** and **b** is **_:node2** then, **_:node1** => **${ schemaRelationshipName }** => **_:node2**`

      typedefs.mutate.RelationshipInsertTypes += `\n *
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipInsert
 * @property { typeof enums.aceDo.RelationshipInsert } do - Insert Relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipInsertHow } how
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipInsertHow
 * @property { '${ schemaRelationshipName }' } relationship - Insert **${ schemaRelationshipName }** relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipInsertProps } props
 * @typedef { object & { [propName:string]: any  } } ${ schemaRelationshipName }MutateRequestItemRelationshipInsertProps
 * @property { string } a - ${ abDescription }
 * @property { string } b - ${ abDescription }`

      typedefs.mutate.RelationshipUpdateTypes += `\n *
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipUpdate
 * @property { typeof enums.aceDo.RelationshipUpdate } do - Update Relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateHow } how
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateHow
 * @property { '${ schemaRelationshipName }' } relationship - Update **${ schemaRelationshipName }** relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateProps } props
 * @typedef { object & { [propName:string]: any  } } ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateProps
 * @property { string } _id - The relationship _id you would love to update
 * @property { string } [ a ] - ${ abDescription }
 * @property { string } [ b ] - ${ abDescription }`
  
      typedefs.mutate.RelationshipUpsertTypes += `\n *
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipUpsert
 * @property { typeof enums.aceDo.RelationshipUpsert } do - Upsert Relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertHow } how
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertHow
 * @property { '${ schemaRelationshipName }' } relationship - Upsert **${ schemaRelationshipName }** relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertProps } props
 * @typedef { object & { [propName:string]: any  } } ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertProps
 * @property { string } _id - The relationship _id you would love to upsert
 * @property { string } [ a ] - ${ abDescription }
 * @property { string } [ b ] - ${ abDescription }`

      if (schema.relationships[schemaRelationshipName]?.props) {
        for (const schemaRelationshipPropName in schema.relationships[schemaRelationshipName].props) {
          const schemaProp = schema.relationships[schemaRelationshipName].props[schemaRelationshipPropName]
          const dataType = getDataType(schemaProp.options.dataType)
          const description = `Set to a ${ dataType } value if you would love to update this relationship property, **${ schemaRelationshipPropName }**, in the graph`
          typedefs.Relationships += `\n * @property { ${ dataType } } [ ${ schemaRelationshipPropName } ] ${ schemaProp.options.description || '' }`
          typedefs.query.RelationshipProps += `\n * @property { AceQueryResValuePropValue } [ ${ schemaRelationshipPropName } ] - ${ getQueryPropDescription({ propName: schemaRelationshipPropName, relationshipName: schemaRelationshipName, schemaPropDescription: schemaProp.options.description }) }`
          typedefs.mutate.RelationshipInsertTypes += `\n * @property { ${ dataType } } ${ schemaProp.options.mustBeDefined ? schemaRelationshipPropName : '[ ' + schemaRelationshipPropName + ' ]' } - ${ description }`
          typedefs.mutate.RelationshipUpdateTypes += `\n * @property { ${ dataType } } ${ '[ ' + schemaRelationshipPropName + ' ]' } - ${ description }`
          typedefs.mutate.RelationshipUpsertTypes += `\n * @property { ${ dataType } } ${ '[ ' + schemaRelationshipPropName + ' ]' } - ${ description }`
          typedefs.mutate.SchemaUpdateRelationshipPropNameType += `{ relationship: '${ schemaRelationshipName }', nowName: '${ schemaRelationshipPropName }', newName: string } | `
        }
      }

      const relationshipMapValue = relationshipMap.get(schemaRelationshipName)

      if (relationshipMapValue) {
        for (const { schemaNodeName, schemaNodePropName, schemaProp } of relationshipMapValue) {
          typedefs.query.RelationshipProps += `\n * @property { AceQueryStars | ${ getNodePropResValue(schemaNodeName, schemaNodePropName) } } [ ${ schemaNodePropName } ] - ${ getRelationshipQueryPropDescription(schemaNodeName, schemaNodePropName, schemaProp) }`
        }
      }

      if (!typedefs.query.Relationships) typedefs.query.Relationships += `\n\n\n/** Query: Relationship's (from schema)\n`

      typedefs.query.Relationships += ` *
 * @typedef { object } ${ schemaRelationshipName }QueryRequestItemRelationship
 * @property { typeof enums.aceDo.RelationshipQuery } do
 * @property { ${ schemaRelationshipName }QueryRequestItemRelationshipHow } how
 * @typedef { object } ${ schemaRelationshipName }QueryRequestItemRelationshipHow
 * @property { '${ schemaRelationshipName }' } relationship
 * @property { string } resKey
 * @property { AceQueryStars | ${ schemaRelationshipName }QueryRequestItemRelationshipResValue } resValue
 * @typedef { object } ${ schemaRelationshipName }QueryRequestItemRelationshipResValue
 * @property { AceQueryResValuePropValue } [ _id ]
 * @property { AceQueryRequestItemRelationshipOptions } [ $o ]${ typedefs.query.RelationshipProps }
`

      typedefs.Relationships += '\n *'
    }
  }


  if (typedefs.Nodes) typedefs.Nodes += '/\n\n\n'
  if (typedefs.query.Nodes) typedefs.query.Nodes += ' */'
  if (typedefs.Relationships) typedefs.Relationships += '/\n\n\n'
  if (typedefs.query.Relationships) typedefs.query.Relationships += ' */'
  if (typedefs.mutate.NodeInsertTypes) typedefs.mutate.NodeInsertTypes += '\n */'
  if (typedefs.mutate.NodeUpdateTypes) typedefs.mutate.NodeUpdateTypes += '\n */'
  if (typedefs.mutate.NodeUpsertTypes) typedefs.mutate.NodeUpsertTypes += '\n */'
  if (typedefs.query.RelationshipPropTypes) typedefs.query.RelationshipPropTypes += '/'
  if (typedefs.query.NodePipes) typedefs.query.NodePipes = typedefs.query.NodePipes.slice(0, -3)
  if (typedefs.mutate.RelationshipInsertTypes) typedefs.mutate.RelationshipInsertTypes += '\n */'
  if (typedefs.mutate.RelationshipUpdateTypes) typedefs.mutate.RelationshipUpdateTypes += '\n */'
  if (typedefs.mutate.RelationshipUpsertTypes) typedefs.mutate.RelationshipUpsertTypes += '\n */'
  if (typedefs.mutate.NodeInsertPipes) typedefs.mutate.NodeInsertPipes = typedefs.mutate.NodeInsertPipes.slice(0, -3)
  if (typedefs.mutate.NodeUpdatePipes) typedefs.mutate.NodeUpdatePipes = typedefs.mutate.NodeUpdatePipes.slice(0, -3)
  if (typedefs.mutate.NodeUpsertPipes) typedefs.mutate.NodeUpsertPipes = typedefs.mutate.NodeUpsertPipes.slice(0, -3)
  if (typedefs.query.RelationshipPipes) typedefs.query.RelationshipPipes = typedefs.query.RelationshipPipes.slice(0, -3)
  if (typedefs.mutate.RelationshipInUpProps) typedefs.mutate.RelationshipInUpProps = typedefs.mutate.RelationshipInUpProps.slice(0, -3)
  if (typedefs.mutate.RelationshipInsertPipes) typedefs.mutate.RelationshipInsertPipes = typedefs.mutate.RelationshipInsertPipes.slice(0, -3)
  if (typedefs.mutate.RelationshipUpdatePipes) typedefs.mutate.RelationshipUpdatePipes = typedefs.mutate.RelationshipUpdatePipes.slice(0, -3)
  if (typedefs.mutate.RelationshipUpsertPipes) typedefs.mutate.RelationshipUpsertPipes = typedefs.mutate.RelationshipUpsertPipes.slice(0, -3)
  if (typedefs.mutate.SchemaUpdateNodeNameType) typedefs.mutate.SchemaUpdateNodeNameType = '(' + typedefs.mutate.SchemaUpdateNodeNameType.slice(0, -3) + ')[]'
  if (typedefs.mutate.SchemaUpdateNodePropNameType) typedefs.mutate.SchemaUpdateNodePropNameType = '(' + typedefs.mutate.SchemaUpdateNodePropNameType.slice(0, -3) + ')[]'
  if (typedefs.mutate.SchemaUpdateRelationshipNameType) typedefs.mutate.SchemaUpdateRelationshipNameType = '(' + typedefs.mutate.SchemaUpdateRelationshipNameType.slice(0, -3) + ')[]'
  if (typedefs.mutate.SchemaUpdateRelationshipPropNameType) typedefs.mutate.SchemaUpdateRelationshipPropNameType = '(' + typedefs.mutate.SchemaUpdateRelationshipPropNameType.slice(0, -3) + ')[]'
  if (typedefs.mutate.NodeDeleteDataAndDeleteFromSchemaType) typedefs.mutate.NodeDeleteDataAndDeleteFromSchemaType = '(' + typedefs.mutate.NodeDeleteDataAndDeleteFromSchemaType.slice(0, -3) + ')'
  if (typedefs.mutate.NodePropDeleteDataAndDeleteFromSchemaType) typedefs.mutate.NodePropDeleteDataAndDeleteFromSchemaType = '(' + typedefs.mutate.NodePropDeleteDataAndDeleteFromSchemaType.slice(0, -3) + ')[]'

  typedefs.query.NodeType = plop({
    now: typedefs.query.NodePipes,
    left: ' * @typedef { ',
    right: ' } AceQueryRequestItemNode',
    default: ` * @typedef { object } AceQueryRequestItemNode
 * @property { typeof enums.aceDo.NodeQuery } do
 * @property { AceQueryRequestItemNodeHow } how
 * @typedef { object } AceQueryRequestItemNodeHow
 * @property { string } node
 * @property { string } resKey
 * @property { AceQueryStars | AceQueryRequestItemNodeResValue } resValue`
  })


  typedefs.query.RelationshipType = plop({
    now: typedefs.query.RelationshipPipes,
    left: ' * @typedef { ',
    right: ' } AceQueryRequestItemRelationship',
    default: ` * @typedef { object } AceQueryRequestItemRelationship
 * @property { typeof enums.aceDo.RelationshipQuery } do
 * @property { AceQueryRequestItemRelationshipHow } how
 * @typedef { object } AceQueryRequestItemRelationshipHow
 * @property { string } relationship
 * @property { string } resKey
 * @property { AceQueryStars | AceQueryRequestItemRelationshipResValue } resValue`
  })


  typedefs.mutate.NodeInsertType = plop({
    now: typedefs.mutate.NodeInsertPipes,
    left: '\n *\n * @typedef { ',
    right: ' } AceMutateRequestItemNodeInsert',
    default: `\n *\n * @typedef { object } AceMutateRequestItemNodeInsert
 * @property { typeof enums.aceDo.NodeInsert } do
 * @property { AceMutateRequestItemNodeInsertHow } how
 * @typedef { object } AceMutateRequestItemNodeInsertHow
 * @property { string } node
 * @property { AceMutateRequestItemNodeInsertProps } props
 * @typedef { { id?: string | number, [propName: string]: any, $o?: AceMutateRequestOptions } } AceMutateRequestItemNodeInsertProps`
  })

  typedefs.mutate.NodeUpdateType = plop({
    now: typedefs.mutate.NodeUpdatePipes,
    left: '\n *\n * @typedef { ',
    right: ' } AceMutateRequestItemNodeUpdate',
    default: `\n *\n * @typedef { object } AceMutateRequestItemNodeUpdate
 * @property { typeof enums.aceDo.NodeUpdate } do
 * @property { AceMutateRequestItemNodeUpdateHow } how
 * @typedef { object } AceMutateRequestItemNodeUpdateHow
 * @property { string } node
 * @property { AceMutateRequestItemNodeUpdateProps } props
 * @typedef { { id: string | number, [propName: string]: any, $o?: AceMutateRequestOptions } } AceMutateRequestItemNodeUpdateProps`
  })

  typedefs.mutate.NodeUpsertType = plop({
    now: typedefs.mutate.NodeUpsertPipes,
    left: '\n *\n * @typedef { ',
    right: ' } AceMutateRequestItemNodeUpsert',
    default: `\n *\n * @typedef { object } AceMutateRequestItemNodeUpsert
 * @property { typeof enums.aceDo.NodeUpsert } do
 * @property { AceMutateRequestItemNodeUpsertHow } how
 * @typedef { object } AceMutateRequestItemNodeUpsertHow
 * @property { string } node
 * @property { AceMutateRequestItemNodeUpsertProps } props
 * @typedef { { id: string | number, [propName: string]: any, $o?: AceMutateRequestOptions } } AceMutateRequestItemNodeUpsertProps`
  })

  typedefs.mutate.RelationshipInsertType = plop({
    now: typedefs.mutate.RelationshipInsertPipes,
    left: '\n *\n * @typedef { ',
    right: ' } AceMutateRequestItemRelationshipInsert',
    default: `\n *\n * @typedef { object } AceMutateRequestItemRelationshipInsert
 * @property { typeof enums.aceDo.RelationshipInsert } do
 * @property { AceMutateRequestItemRelationshipInsertHow } how
 * @typedef { object } AceMutateRequestItemRelationshipInsertHow
 * @property { string } relationship
 * @property { AceMutateRequestItemRelationshipInsertProps } props
 * @typedef { { a: string, b: string, [propName: string]: any, $o?: AceMutateRequestOptions } } AceMutateRequestItemRelationshipInsertProps`
  })

  typedefs.mutate.RelationshipUpdateType = plop({
    now: typedefs.mutate.RelationshipUpdatePipes,
    left: '\n *\n * @typedef { ',
    right: ' } AceMutateRequestItemRelationshipUpdate',
    default: `\n *\n * @typedef { object } AceMutateRequestItemRelationshipUpdate
 * @property { typeof enums.aceDo.RelationshipUpdate } do
 * @property { AceMutateRequestItemRelationshipUpdateHow } how
 * @typedef { object } AceMutateRequestItemRelationshipUpdateHow
 * @property { string } relationship
 * @property { AceMutateRequestItemRelationshipUpdateProps } props
 * @typedef { { a: string, b: string, [propName: string]: any, $o?: AceMutateRequestOptions } } AceMutateRequestItemRelationshipUpdateProps`
  })

  typedefs.mutate.RelationshipUpsertType = plop({
    now: typedefs.mutate.RelationshipUpsertPipes,
    left: '\n *\n * @typedef { ',
    right: ' } AceMutateRequestItemRelationshipUpsert',
    default: `\n *\n * @typedef { object } AceMutateRequestItemRelationshipUpsert
 * @property { typeof enums.aceDo.RelationshipUpsert } do
 * @property { AceMutateRequestItemRelationshipUpsertHow } how
 * @typedef { object } AceMutateRequestItemRelationshipUpsertHow
 * @property { string } relationship
 * @property { AceMutateRequestItemRelationshipUpsertProps } props
 * @typedef { { a: string, b: string, [propName: string]: any, $o?: AceMutateRequestOptions } } AceMutateRequestItemRelationshipUpsertProps`
  })

  return typedefs
}


/**
 * @param { string } dataType 
 * @returns { string }
 */
function getDataType (dataType) {
  switch (dataType) {
    case 'hash':
    case 'isoString':
      return 'string'
    default:
      return dataType
  }
}


/**
 * Plop (place between left and right) or default
 * @param { { now: string, left: string, right: string, default: string } } options 
 * @returns { string }
 */
function plop (options) {
  let response = ''
  let now = options.now

  if (!now) response = options.default
  else response = options.left + now + options.right

  return response
}


/**
 * @param { string } nodeName
 * @param { string } propName
 * @returns { string }
 */
function getNodePropResValue (nodeName, propName) {
  return nodeName + DELIMITER + propName + DELIMITER + 'ResValue'
}


/**
 * @typedef { object } GetPropDescriptionOptions
 * @property { string } propName
 * @property { string } [ nodeName ]
 * @property { string } [ relationshipName ]
 * @property { string } [ schemaPropDescription ]
 *
 * @param { GetPropDescriptionOptions } options 
 * @returns { string }
 */
function getQueryPropDescription (options) {
  return `Set to true to see ${ options.nodeName ? 'node' : 'relationship' } name **${ options.nodeName ? options.nodeName : options.relationshipName }** & property name **${ options.propName }** in the response. A **{ alias: string }** object is also available. ${ options.schemaPropDescription || '' }`
}


/**
 * @param { string } schemaNodeName 
 * @param { string } schemaNodePropName 
 * @param {*} schemaProp 
 * @returns 
 */
function getRelationshipQueryPropDescription (schemaNodeName, schemaNodePropName, schemaProp) {
  return `Return object to see node name: **${ schemaNodeName }** and prop name: **${ schemaNodePropName }**, that will provide properties on the **${ schemaProp.options.node }** node in the response`
}
