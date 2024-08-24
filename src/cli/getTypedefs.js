import { isObjectPopulated } from '../util/isObjectPopulated.js'
import { delimiter, lastIdKey, schemaId } from '../util/variables.js'


/**
 * @param { { nodes: any; relationships: any; } | null } schema
 * @returns { string }
 */
export function getTypedefs (schema) {
  const typedefs = getSchemaTypedefs(schema)

  return `import * as enums from './enums.js'


${ typedefs.Nodes }${ typedefs.Relationships }/** AceGraph
 *
 * @typedef { string | number | boolean | (string | number)[] | number[] } AceGraphValue
 * 
 * @typedef { { $aK: string, $aA: enums.writeAction, index: string | number | (string | number)[] | number[] } } AceGraphIndex
 * @typedef { { $aK: '${ lastIdKey }', $aA: enums.writeAction, value: number } } AceGraphLastKey
 * @typedef { { $aK: number, $aA: enums.writeAction, $aN: string, [propName: string]: any } } AceGraphNode
 * @typedef { { $aK: number, $aA: enums.writeAction, $aR: string, a: (string | number), b: (string | number), [propName: string]: any } } AceGraphRelationship
 * @typedef { { $aK: string | number, $aA: typeof enums.writeAction.delete } } AceGraphDelete
 * @typedef { AceGraphNode | AceGraphRelationship | AceGraphIndex | AceGraphLastKey | AceGraphDelete } AceGraphItem
 *
 * @typedef { null | { match: number, start?: never } | { start: number, match?: never } } AceGraphIndexSearchRes
 */


/** AceMemory
 *
 * @typedef { object } AceMemory
 * @prop { AceQueueItem[] } queue
 * @prop { AceTxn } txn
 * @prop { AceMemoryAol } aol
 * @prop { Intl.Collator } collator
 *
 * @typedef { object } AceMemoryAol
 * @prop { number | null } ogFileSize - filehandle.stat() on the aol file
 * @prop { number | null } nowFileSize - the new file size after an append
 * @prop { AceGraphItem[] } array
 * @prop { AceFileHandle } [ filehandle ]
 */


/** AceTxn
 *
 * @typedef { object } AceTxn
 * @property { string } [ id ]
 * @property { string } [ env ]
 * @property { NodeJS.Timeout } [ timeoutId ]
 * @property { enums.txnSteps } step
 * @property { AceSchema | null } schema
 * @property { AceTxnSchemaDataStructures } schemaDataStructures
 * @property { boolean } [ schemaUpdated ]
 * @property { boolean } [ schemaPushRequested ]
 * @property { boolean } [ schemaPushRequestedThenSchemaUpdated ]
 * @property { AceSchemaDetails } [ schemaNowDetails ]
 * @property { AceSchemaDetails } [ schemaOriginalDetails ]
 * @property { number | null } startGraphId
 * @property { number | null } lastGraphId
 * @property { boolean } [ hasUpdates ]
 * @property { string } [ emptyTimestamp ]
 * @property { Map<string, number> } enumGraphIds
 * @property { AceGraphItem[] } writeArray
 * @property { Map<string, { schemaProp: AceSchemaProp | AceSchemaRelationshipProp, nodeOrRelationshipName: string, propName: string, newIds: (string | number)[] }> } sortIndexMap - If we add a node and prop and that node+prop has a sort index, put the newly created nodes in here
 * @property { AceFilePaths } [ paths ]
 *
 * @typedef { object } AceTxnSchemaDataStructures
 * @property { Map<string, AceTxnSchemaDataStructuresDefaultItem[]> } defaults
 * @property { Map<string, Map<string, { node: string, prop: string, relationship: string }>> } nodeRelationshipPropsMap
 * @property { Map<number, { node?: string, relationship?: string, prop?: string }> } byAceId
 * @property { Map<string, Map<string, { propNode: string, propValue: AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp }>> } relationshipPropsMap
 * @property { Map<string, Map<string, (AceSchemaProp | AceSchemaRelationshipProp | AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp)>> } mustPropsMap
 *
 * @typedef { object } AceTxnSchemaDataStructuresDefaultItem
 * @property { string } prop
 * @property { any } [ value ]
 * @property { 'setIsoNow' } [ do ]
 */


/** AceQueue
 *
 * @typedef { object } AceQueueItem
 * @property { (res: AceFnResponse) => void } resolve
 * @property { AcePromiseReject } reject
 * @property { AceFnOptions } options
 */


/** AceFile
 *
 * @typedef { import('node:fs/promises').FileHandle } AceFileHandle - Just a typical node file handle: \`import('node:fs/promises').FileHandle\` just does the import once
 *
 * @typedef { ('dir' | 'trash' | 'graphs' | 'graphDetails' | 'schemas' | 'aol' | 'trashNow')[] } AceFileInitPathsTypes
 * @typedef { ('dir' | 'aol' | 'trash' | 'graphs' | 'graphDetails' | 'schemas' | 'schemaDetails' | 'trashNow' | 'trashNowAol'  | 'trashNowGraphs' | 'trashNowSchemas')[] } AceFileGetPathsTypes
 * @typedef { { dir: string, aol: string, trash: string, graphs: string, graphDetails: string, schemas: string, schemaDetails: string, trashNow?: string, trashNowAol?: string, trashNowGraphs?: string, trashNowSchemas?: string } } AceFilePaths
 */


/** AceFn
 *
 * @typedef { object } AceFnOptions
 * @property { string } dir - Directory that holds graph information, relative to your package.json file
 * @property { string } env - Your process.env.NODE_ENV. Env allows different schema versions in different environments (eg: local, qa, production)
 * @property { AceFnRequest } [ req ]
 * @property { AceFnOptionsTxn } [ txn ]
 * @property { AceFnStringJWKs } [ jwks ]
 * @property { AceFnIVs } [ ivs ]
 *
 * @typedef { AceFnOptionsTxnStart | AceFnOptionsTxnComplete | AceFnOptionsTxnCancel | AceFnOptionsTxnContinue } AceFnOptionsTxn
 * 
 * @typedef { object } AceFnOptionsTxnStart
 * @property { typeof enums.txnDo.Start } do
 * @property { number } [ maxSeconds ] - Max number of seconds this transaction can be pending before Ace cancels it. The default is 9 seconds.
 * @property { never } [ id ]
 *
 * @typedef { object } AceFnOptionsTxnComplete
 * @property { typeof enums.txnDo.Complete } do
 * @property { string } id
 *
 * @typedef { object } AceFnOptionsTxnCancel
 * @property { typeof enums.txnDo.Cancel } do
 * @property { string } id
 *
 * @typedef { object } AceFnOptionsTxnContinue
 * @property { string } id
 * @property { never } [ do ]
 * 
 * @typedef { { enumIds?: { [id: string]: number }, deletedKeys?: (string | number)[] } } AceFn$Default
 *
 * @typedef { { [prop: string]: any } & { $ace: AceFn$Default & { txnId: string, txnStarted: true,   txnCancelled?: never, txnCompleted?: never } } } AceFnTxnStartResponse
 * @typedef { { [prop: string]: any } & { $ace: AceFn$Default & { txnId: string, txnStarted?: never, txnCancelled: true,   txnCompleted?: never } } } AceFnTxnCancelResponse
 * @typedef { { [prop: string]: any } & { $ace: AceFn$Default & { txnId: string, txnStarted?: never, txnCancelled?: never, txnCompleted: true } } } AceFnTxnCompleteResponse
 * @typedef { { [prop: string]: any } & { $ace: AceFn$Default & { txnId: string, txnStarted?: never, txnCancelled?: never, txnCompleted?: never } } } AceFnTxnContinueResponse
 * @typedef { { [prop: string]: any } & { $ace: AceFn$Default & { txnId?: never, txnStarted?: never, txnCancelled?: never, txnCompleted?: never } } } AceFnNoTxnResponse
 *
 * @typedef { AceQueryRequestItem | AceMutateRequestItem } AceFnRequestItem
 * 
 * @typedef { AceFnRequestItem | (AceFnRequestItem)[] } AceFnRequest
 * @typedef { AceFnTxnStartResponse | AceFnTxnCancelResponse | AceFnTxnCompleteResponse | AceFnTxnContinueResponse | AceFnNoTxnResponse } AceFnResponse
 * @typedef { { now: AceFnResponse, original: { [k: string]: any } } } AceFnFullResponse
 * @typedef { { success: true } } AceFnEmptyGraphResponse
 *
 * @typedef { { [name: string]: { type: 'private' | 'public' | 'crypt', jwk: string } } } AceFnStringJWKs
 * @typedef { { [name: string]: CryptoKey } } AceFnCryptoJWK
 * @typedef { { private: AceFnCryptoJWK, public: AceFnCryptoJWK, crypt: AceFnCryptoJWK } } AceFnCryptoJWKs
 *
 * @typedef { { [name: string]: string } } AceFnIVs
 *
 * @typedef { { nodes: any, relationships: any } } AceFnUpdateRequestItems - If updating we store the orignal items here, based on the id (nodes) or id (relationships)
 *
 * @typedef { { res?: AceFnFullResponse, error?: any, resolve?: (res: AceFnResponse) => void, reject?: AcePromiseReject } } AceFnDoneReqGatewayParams
 * @typedef { Promise<void> } AceFnDoneReqGatewayResponse
 */


/** AceSecure
 *
 * @typedef { object } AceSecureParams
 * @property { AceFnOptions } options
 * @property { { correct: string, req: string } } token
 */


/** AceSchema
 * 
 * @typedef { { lastId: number, nowId: number } } AceSchemaDetail
 * @typedef { { [env: string]: AceSchemaDetail } } AceSchemaDetails
 *
 * @typedef { { lastId: number, nodes: { [nodeName: string]: AceSchemaNodeValue & { $aceId: number } }, relationships?: { [relationshipName: string]: AceSchemaRelationshipValue & { $aceId: number } } } } AceSchema
 * @typedef { { [nodePropName: string]: AceSchemaProp | AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp } } AceSchemaNodeValue
 *
 * @typedef { AceSchemaRelationshipValueOneToOne | AceSchemaRelationshipValueOneToMany | AceSchemaRelationshipValueManyToMany } AceSchemaRelationshipValue
 *
 * @typedef { object } AceSchemaRelationshipValueOneToOne
 * @property { number } $aceId
 * @property { typeof enums.schemaIs.OneToOne } is - This is a one to one relationship
 * @property { AceSchemaRelationshipProps  } [ props ]
 *
 * @typedef { object } AceSchemaRelationshipValueOneToMany
 * @property { number } $aceId
 * @property { typeof enums.schemaIs.OneToMany  } is - This is a one to many relationship
 * @property { AceSchemaRelationshipProps  } [ props ]
 *
 * @typedef { object } AceSchemaRelationshipValueManyToMany
 * @property { number } $aceId
 * @property { typeof enums.schemaIs.ManyToMany  } is - This is a many to many relationship
 * @property { AceSchemaRelationshipProps  } [ props ]
 *
 * @typedef { object } AceSchemaProp
 * @property { number } $aceId
 * @property { typeof enums.schemaIs.Prop  } is - This is a standard node prop
 * @property { AceSchemaPropOptions } options
 *
 * @typedef { object } AceSchemaRelationshipProp
 * @property { number } $aceId
 * @property { typeof enums.schemaIs.RelationshipProp } is - This is a relationship prop
 * @property { AceSchemaPropOptions } options
 *
 * @typedef { object } AceSchemaForwardRelationshipProp
 * @property { number } $aceId
 * @property { typeof enums.schemaIs.ForwardRelationshipProp } is - A **Forward** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
 * @property { AceSchemaNodeRelationshipOptions } options
 *
 * @typedef { object } AceSchemaReverseRelationshipProp
 * @property { number } $aceId
 * @property { typeof enums.schemaIs.ReverseRelationshipProp } is - A **Reverse** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
 * @property { AceSchemaNodeRelationshipOptions } options
 *
 * @typedef { object } AceSchemaBidirectionalRelationshipProp
 * @property { number } $aceId
 * @property { typeof enums.schemaIs.BidirectionalRelationshipProp } is - A **Bidirectional** node relationship prop. Meaning there is only one prop name and it represents both directions. For example if we a relationship name of **isFriendsWith**, the **friends** prop is the **Bidirectional** prop
 * @property { AceSchemaNodeRelationshipOptions } options
 *
 * @typedef { object } AceSchemaPropOptions
 * @property { enums.dataTypes } dataType - The data type for this property
 * @property { boolean } [ mustBeDefined ] - Must this schema prop be defined
 * @property { boolean } [ sortIndex ] - Should Ace maintain a sort index for this property. The index will be an array of all this node's id's in the order they are when all these node's are sorted by this property.
 * @property { boolean } [ uniqueIndex ] - Should Ace maintain a unique index for this property. This way you'll know no nodes in your graph have the same value for this property and a AceQueryFind will be faster if searching by this property.
 * @property { string } [ description ] - Custom description that Ace will add to other types, example: query / mutation types
 * @property { any } [ default ]
 *
 * @typedef { object } AceSchemaNodeRelationshipOptions
 * @property { enums.schemaHas } has - Does this node have a max of **one** of these props or a max of **many**
 * @property { string } node - The node name that this prop points to
 * @property { string } relationship - Each node prop that is a relationship must also align with a relationship name. This way the relationship can have its own props.
 * @property { boolean } [ mustBeDefined ] - Must each node in the graph, that aligns with this relationship, have this relationship defined
 * @property { string } [ description ] - Custom description that Ace will add to other types, example: query / mutation types
 * @property { boolean } [ cascade ] - When this schema.node is deleted, also delete the node that this prop points to
 * @property { never } [ default ]
 *
 * @typedef { { [propName: string]: AceSchemaRelationshipProp } } AceSchemaRelationshipProps - Props for this relationship
 * @typedef { { [propName: string]: AceSchemaRelationshipPropAddition } } AceSchemaRelationshipPropsAddition - Props for this relationship
 *
 * @typedef { object } AceSchemaDirectionsMapDirection
 * @property { string } nodeName
 * @property { string } nodePropName
 * @property { typeof enums.schemaIs.ForwardRelationshipProp | typeof enums.schemaIs.ReverseRelationshipProp | typeof enums.schemaIs.BidirectionalRelationshipProp } id
 *
 * @typedef { { lastId?: never, nodes: { [nodeName: string]: AceSchemaNodeValueAddition & { $aceId?: never } }, relationships?: { [relationshipName: string]: AceSchemaRelationshipValueAddition & { $aceId?: never } } } } AceSchemaAddition
 * @typedef { { [nodePropName: string]: AceSchemaPropAddition | AceSchemaForwardRelationshipPropAddition | AceSchemaReverseRelationshipPropAddition | AceSchemaBidirectionalRelationshipPropAddition } } AceSchemaNodeValueAddition
 *
 * @typedef { AceSchemaRelationshipValueOneToOneAddition | AceSchemaRelationshipValueOneToManyAddition | AceSchemaRelationshipValueManyToManyAddition } AceSchemaRelationshipValueAddition
 *
 * @typedef { object } AceSchemaRelationshipValueOneToOneAddition
 * @property { never } [ $aceId ]
 * @property { typeof enums.schemaIs.OneToOne } is - This is a one to one relationship
 * @property { AceSchemaRelationshipPropsAddition  } [ props ]
 *
 * @typedef { object } AceSchemaRelationshipValueOneToManyAddition
 * @property { never } [ $aceId ]
 * @property { typeof enums.schemaIs.OneToMany  } is - This is a one to many relationship
 * @property { AceSchemaRelationshipPropsAddition  } [ props ]
 *
 * @typedef { object } AceSchemaRelationshipValueManyToManyAddition
 * @property { never } [ $aceId ]
 * @property { typeof enums.schemaIs.ManyToMany  } is - This is a many to many relationship
 * @property { AceSchemaRelationshipPropsAddition  } [ props ]
 *
 * @typedef { object } AceSchemaPropAddition
 * @property { never } [ $aceId ]
 * @property { typeof enums.schemaIs.Prop  } is - This is a standard node prop
 * @property { AceSchemaPropOptions } options
 *
 * @typedef { object } AceSchemaRelationshipPropAddition
 * @property { never } [ $aceId ]
 * @property { typeof enums.schemaIs.RelationshipProp } is - This is a relationship prop
 * @property { AceSchemaPropOptions } options
 *
 * @typedef { object } AceSchemaForwardRelationshipPropAddition
 * @property { never } [ $aceId ]
 * @property { typeof enums.schemaIs.ForwardRelationshipProp } is - A **Forward** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
 * @property { AceSchemaNodeRelationshipOptions } options
 *
 * @typedef { object } AceSchemaReverseRelationshipPropAddition
 * @property { never } [ $aceId ]
 * @property { typeof enums.schemaIs.ReverseRelationshipProp } is - A **Reverse** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
 * @property { AceSchemaNodeRelationshipOptions } options
 *
 * @typedef { object } AceSchemaBidirectionalRelationshipPropAddition
 * @property { never } [ $aceId ]
 * @property { typeof enums.schemaIs.BidirectionalRelationshipProp } is - A **Bidirectional** node relationship prop. Meaning there is only one prop name and it represents both directions. For example if we a relationship name of **isFriendsWith**, the **friends** prop is the **Bidirectional** prop
 * @property { AceSchemaNodeRelationshipOptions } options
 */


/** AceMutate
 *
 * @typedef { AceMutateRequestItemEmpty | AceMutateRequestItemBackupLoad | AceMutateRequestItemSchema | AceMutateRequestItemNode | AceMutateRequestItemRelationship } AceMutateRequestItem
 * @typedef { AceMutateRequestItemSchemaAdd | AceMutateRequestItemSchemaRenameNode | AceMutateRequestItemSchemaRenameNodeProp | AceMutateRequestItemSchemaRenameRelationship | AceMutateRequestItemSchemaRenameRelationshipProp | AceMutateRequestItemSchemaDeleteNodes | AceMutateRequestItemSchemaDeleteNodeProps | AceMutateRequestItemSchemaUpdateNodePropHas | AceMutateRequestItemSchemaUpdateNodePropCascade | AceMutateRequestItemSchemaUpdatePropDefault | AceMutateRequestItemSchemaUpdatePropMustBeDefined | AceMutateRequestItemSchemaUpdatePropSortIndex | AceMutateRequestItemSchemaUpdatePropUniqueIndex | AceMutateRequestItemSchemaPush } AceMutateRequestItemSchema
 * @typedef { AceMutateRequestItemNodeInsert | AceMutateRequestItemNodeUpdate | AceMutateRequestItemNodeUpsert | AceMutateRequestItemNodeDelete | AceMutateRequestItemNodePropDelete | AceMutateRequestItemSchemaDeleteNodes | AceMutateRequestItemSchemaDeleteNodeProps } AceMutateRequestItemNode
 * @typedef { AceMutateRequestItemRelationshipInsert | AceMutateRequestItemRelationshipUpdate | AceMutateRequestItemRelationshipUpsert | AceMutateRequestItemRelationshipDelete | AceMutateRequestItemRelationshipPropDelete } AceMutateRequestItemRelationship
 *
 * @typedef { object } AceMutateRequestItemBackupLoad
 * @property { typeof enums.aceDo.BackupLoad } do
 * @property { AceMutateRequestItemBackupLoadHow } how
 * @typedef { object } AceMutateRequestItemBackupLoadHow
 * @property { string } backup
 * @property { boolean } [ skipDataDelete ]
 *
 * @typedef { AceMutateRequestItemEmptyGraph | AceMutateRequestItemEmptyTrash } AceMutateRequestItemEmpty
 *
 * @typedef { object } AceMutateRequestItemEmptyGraph
 * @property { typeof enums.aceDo.EmptyGraph } do - Delete schema and all datamfrom graph
 *
 * @typedef { object } AceMutateRequestItemEmptyTrash
 * @property { typeof enums.aceDo.EmptyTrash } do - Delete all folders in trash${ typedefs.mutate.NodeInsertType }${ typedefs.mutate.RelationshipInsertType }${ typedefs.mutate.NodeUpdateType }${ typedefs.mutate.RelationshipUpdateType }${ typedefs.mutate.NodeUpsertType }${ typedefs.mutate.RelationshipUpsertType }
 *
 * @typedef { AceMutateRequestItemRelationshipInsert | AceMutateRequestItemRelationshipUpdate | AceMutateRequestItemRelationshipUpsert } AceMutateRequestItemRelationshipInup
 *
 * @typedef { AceMutateRequestItemNodeUpdate & { [relationshipProp: string]: string[] } } AceMutateRequestItemNodeWithRelationships
 *
 * @typedef { object } AceMutateRequestItemNodeDelete
 * @property { typeof enums.aceDo.NodeDelete } do
 * @property { (string | number)[] } how - The ids you'd love deleted. To cascade delete, add cascade to the schema
 *
 * @typedef { object } AceMutateRequestItemRelationshipDelete
 * @property { typeof enums.aceDo.RelationshipDelete } do
 * @property { { _ids: (string | number)[] } } how
 *
 * @typedef { object } AceMutateRequestItemNodePropDelete
 * @property { typeof enums.aceDo.NodePropDelete } do
 * @property { { ids: (string | number)[], props: string[] } } how
 *
 * @typedef { object } AceMutateRequestItemRelationshipPropDelete
 * @property { typeof enums.aceDo.RelationshipPropDelete } do
 * @property { { _ids: (string | number)[], props: string[] } } how
 *
 * @typedef { object } AceMutateRequestItemSchemaDeleteNodes
 * @property { typeof enums.aceDo.SchemaDeleteNodes } do
 * @property { AceMutateRequestItemSchemaDeleteNodesItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaDeleteNodesType || 'string' } } AceMutateRequestItemSchemaDeleteNodesItem
 *
 * @typedef { object } AceMutateRequestItemSchemaDeleteRelationships
 * @property { typeof enums.aceDo.SchemaDeleteRelationships } do
 * @property { AceMutateRequestItemSchemaDeleteRelationshipsItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaDeleteRelationshipsType || 'string' } } AceMutateRequestItemSchemaDeleteRelationshipsItem
 *
 * @typedef { object } AceMutateRequestItemSchemaDeleteRelationshipProps
 * @property { typeof enums.aceDo.SchemaDeleteRelationshipProps } do
 * @property { AceMutateRequestItemSchemaDeleteRelationshipPropsItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaDeleteRelationshipPropsType || '{ relationship: string, prop: string }' } } AceMutateRequestItemSchemaDeleteRelationshipPropsItem
 *
 * @typedef { object } AceMutateRequestItemSchemaDeleteNodeProps
 * @property { typeof enums.aceDo.SchemaDeleteNodeProps } do
 * @property { AceMutateRequestItemSchemaDeleteNodePropsItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaDeleteNodePropsType || '{ node: string, prop: string }' } } AceMutateRequestItemSchemaDeleteNodePropsItem
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdatePropDefault - ${ typedefs.description.SchemaUpdatePropDefault }
 * @property { typeof enums.aceDo.SchemaUpdatePropDefault } do - ${ typedefs.description.SchemaUpdatePropDefault }
 * @property {  AceMutateRequestItemSchemaUpdatePropDefaultItem[] } how - ${ typedefs.description.SchemaUpdatePropDefault }
 * @typedef { ${ typedefs.mutate.SchemaUpdatePropDefaultType || '{ nodeOrRelationship: string, prop: string, default?: any }'} } AceMutateRequestItemSchemaUpdatePropDefaultItem - ${ typedefs.description.SchemaUpdatePropDefault }
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdatePropMustBeDefined
 * @property { typeof enums.aceDo.SchemaUpdatePropMustBeDefined } do
 * @property { AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaUpdatePropMustBeDefinedType || '{ nodeOrRelationship: string, prop: string, mustBeDefined: boolean }'} } AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdatePropSortIndex
 * @property { typeof enums.aceDo.SchemaUpdatePropSortIndex } do
 * @property { AceMutateRequestItemSchemaUpdatePropSortIndexItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaUpdatePropSortIndexType || '{ nodeOrRelationship: string, prop: string, sortIndex: boolean }'} } AceMutateRequestItemSchemaUpdatePropSortIndexItem
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdatePropUniqueIndex
 * @property { typeof enums.aceDo.SchemaUpdatePropUniqueIndex } do
 * @property { AceMutateRequestItemSchemaUpdatePropUniqueIndexItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaUpdatePropUniqueIndexType || '{ nodeOrRelationship: string, prop: string, uniqueIndex: boolean }'} } AceMutateRequestItemSchemaUpdatePropUniqueIndexItem
 *
 * @typedef { object } AceMutateRequestItemSchemaRenameNode
 * @property { typeof enums.aceDo.SchemaRenameNode } do
 * @property { AceMutateRequestItemSchemaRenameNodeItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaRenameNodeType || '{ nowName: string, newName: string }' } } AceMutateRequestItemSchemaRenameNodeItem
 *
 * @typedef { object } AceMutateRequestItemSchemaRenameNodeProp
 * @property { typeof enums.aceDo.SchemaRenameNodeProp } do
 * @property { AceMutateRequestItemSchemaRenameNodePropItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaRenameNodePropType || '{ node: string, nowName: string, newName: string }' } } AceMutateRequestItemSchemaRenameNodePropItem
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodePropHas
 * @property { typeof enums.aceDo.SchemaUpdateNodePropHas } do
 * @property { AceMutateRequestItemSchemaUpdateNodePropHasItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaUpdateNodePropHasType || '{ node: string, prop: string, has: enums.schemaHas }' } } AceMutateRequestItemSchemaUpdateNodePropHasItem
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodePropCascade
 * @property { typeof enums.aceDo.SchemaUpdateNodePropCascade } do
 * @property { AceMutateRequestItemSchemaUpdateNodePropCascadeItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaUpdateNodePropCascadeType || '{ node: string, prop: string, cascade: boolean }' } } AceMutateRequestItemSchemaUpdateNodePropCascadeItem
 *
 * @typedef { object } AceMutateRequestItemSchemaRenameRelationship
 * @property { typeof enums.aceDo.SchemaRenameRelationship } do
 * @property { AceMutateRequestItemSchemaRenameRelationshipItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaRenameRelationshipType || '{ nowName: string, newName: string }' } } AceMutateRequestItemSchemaRenameRelationshipItem
 *
 * @typedef { object } AceMutateRequestItemSchemaRenameRelationshipProp
 * @property { typeof enums.aceDo.SchemaRenameRelationshipProp } do
 * @property { AceMutateRequestItemSchemaRenameRelationshipPropItem[] } how
 * @typedef { ${ typedefs.mutate.SchemaRenameRelationshipPropType || '{ relationship: string, nowName: string, newName: string }' } } AceMutateRequestItemSchemaRenameRelationshipPropItem
 *
 * @typedef { object } AceMutateRequestItemSchemaAdd
 * @property { typeof enums.aceDo.SchemaAdd } do
 * @property { AceSchemaAddition } how
 *
 * @typedef { object } AceMutateRequestItemSchemaPush
 * @property { typeof enums.aceDo.SchemaPush } do
 * @property { number } how - Aim version number
 *
 * @typedef { object } AceMutateRequestOptions
 * @property { string } [ cryptJWK ]
 * @property { string } [ privateJWK ]
 * @property { string } [ iv ]
 *
 * @typedef { ${ typedefs.mutate.NodeInsertPropsTypes || '{ id?: string | number, [propName: string]: any }'  } } AceMutateRequestItemNodeInsertProps
 * @typedef { ${ typedefs.mutate.NodeUpdatePropsTypes || typedefs.mutate.DefaultNodeUpPropsTypes  } } AceMutateRequestItemNodeUpdateProps
 * @typedef { ${ typedefs.mutate.NodeUpsertPropsTypes || typedefs.mutate.DefaultNodeUpPropsTypes } } AceMutateRequestItemNodeUpsertProps
 *
 * @typedef { ${ typedefs.mutate.RelationshipInsertPropsTypes || '{ a: string | number, b: string | number, [propName: string]: any }' } } AceMutateRequestItemRelationshipInsertProps
 * @typedef { ${ typedefs.mutate.RelationshipUpdatePropsTypes || typedefs.mutate.DefaultRelationshipUpPropsTypes  } } AceMutateRequestItemRelationshipUpdateProps
 * @typedef { ${ typedefs.mutate.RelationshipUpsertPropsTypes || typedefs.mutate.DefaultRelationshipUpPropsTypes } } AceMutateRequestItemRelationshipUpsertProps
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
 * @typedef { boolean | { alias: string, iv?: never, jwk?: never } | { iv: string, jwk: string, alias?: never } } AceQueryResValuePropValue
 * 
 * @typedef { '*' | '**' | '***' } AceQueryStars
 * @typedef { 'count' } AceQueryCount
 * 
 * @typedef { Set<string> | null } AceQueryResHide
 * 
 * @typedef { object } AceQueryRequestItemDetailedResValueSection
 * @property { string } resValueKey
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
 * @property { AceQueryStars } [ fill ]
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
 * @property { string } [ iv ]
 * @property { string } [ jwk ]
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
 * @property { string } prop - Filter nodes/relationships by this prop that has a unique index
 *
 * @typedef { object } AceQueryFindByUnique
 * @property { string } value - The value Ace will query to find a unique match for
 * @property { string } prop - Find node/relationship by this prop that has a unique index
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


/** AceStorage
 * 
 * @typedef { { key: string | number, index: number, value?: AceGraphItem }[]  } AceStorageSearchGraphEntries
 */


/** AceCLI
 *
 * @typedef { object } AceCLIPromptSwitchCallbacks
 * @property { function(any): Promise<void> } onEnter - Called when the input is a newline or end-of-transmission character.
 * @property { function(any): void } onControlC - Called when the input is the interrupt character (Ctrl+C).
 * @property { function(any): void } onBackspace - Called when the input is a backspace character.
 * @property { function(any): void } onCharacter - Called for any other input.
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
    description: {
      SchemaUpdatePropDefault: 'To remove "default" from a prop in the schema, in the props array, "default" must be undefined',
    },
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
      NodeInsertPropsTypes: '',
      NodeUpdatePropsTypes: '',
      NodeUpsertPropsTypes: '',
      RelationshipInUpProps: '',
      SchemaDeleteNodesType: '',
      RelationshipInsertType: '',
      RelationshipUpdateType: '',
      RelationshipUpsertType: '',
      RelationshipInsertPipes: '',
      RelationshipUpdatePipes: '',
      RelationshipUpsertPipes: '',
      RelationshipInsertTypes: '',
      RelationshipUpdateTypes: '',
      RelationshipUpsertTypes: '',
      SchemaRenameNodeType: '',
      SchemaDeleteNodePropsType: '',
      SchemaUpdateNodePropHasType: '',
      SchemaUpdatePropDefaultType: '',
      SchemaRenameNodePropType: '',
      RelationshipInsertPropsTypes: '',
      RelationshipUpdatePropsTypes: '',
      RelationshipUpsertPropsTypes: '',
      SchemaDeleteRelationshipsType: '',
      SchemaUpdatePropSortIndexType: '',
      SchemaUpdateNodePropCascadeType: '',
      SchemaUpdatePropUniqueIndexType: '',
      SchemaRenameRelationshipType: '',
      SchemaUpdatePropMustBeDefinedType: '',
      SchemaDeleteRelationshipPropsType: '',
      SchemaRenameRelationshipPropType: '',
      DefaultNodeUpPropsTypes: '{ id: string | number, [propName: string]: any }',
      DefaultRelationshipUpPropsTypes: '{ id: string | number, a: string | number, b: string | number, [propName: string]: any }'
    }
  }


  if (isObjectPopulated(schema?.nodes)) {
    typedefs.Nodes += '/** Nodes: (from schema)'
    typedefs.mutate.NodeInsertTypes += '\n\n\n/** Mutate: Insert node (from schema)'
    typedefs.mutate.NodeUpdateTypes += '\n\n\n/** Mutate: Update node (from schema)'
    typedefs.mutate.NodeUpsertTypes += '\n\n\n/** Mutate: Upsert node (from schema)'

    for (const schemaNodeName in schema?.nodes) {
      typedefs.query.NodeProps = '' // reset props from previous loop
      typedefs.mutate.SchemaDeleteNodesType += `'${ schemaNodeName }' | `
      typedefs.query.NodePipes += `${schemaNodeName}QueryRequestItemNode | `
      typedefs.mutate.NodeInsertPipes += `${ schemaNodeName }MutateRequestItemNodeInsert | `
      typedefs.mutate.NodeUpdatePipes += `${ schemaNodeName }MutateRequestItemNodeUpdate | `
      typedefs.mutate.NodeUpsertPipes += `${ schemaNodeName }MutateRequestItemNodeUpsert | `
      typedefs.mutate.NodeUpsertPipes += `${ schemaNodeName }MutateRequestItemNodeUpsert | `
      typedefs.mutate.NodeInsertPropsTypes += `${ schemaNodeName }MutateRequestItemInsertProps | `
      typedefs.mutate.NodeUpdatePropsTypes += `${ schemaNodeName }MutateRequestUpdateItemProps | `
      typedefs.mutate.NodeUpsertPropsTypes += `${ schemaNodeName }MutateRequestUpsertItemProps | `
      typedefs.Nodes += `\n * @typedef { object } ${ schemaNodeName }\n * @property { number } [ id ]`
      typedefs.mutate.SchemaRenameNodeType += `{ nowName: '${ schemaNodeName }', newName: string } | `

      typedefs.mutate.NodeInsertTypes += `\n *
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeInsert
 * @property { typeof enums.aceDo.NodeInsert } do - Insert Node
 * @property { ${ schemaNodeName }MutateRequestItemNodeInsertHow } how
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeInsertHow
 * @property { '${ schemaNodeName }' } node - Insert **${ schemaNodeName }** node
 * @property { ${ schemaNodeName }MutateRequestItemInsertProps } props
 * @property { AceMutateRequestOptions } [ $o ] - Mutation insert options
 * @typedef { ${ schemaNodeName }MutateRequestItemInsertPropsTemp & { [propName: string]: any } } ${ schemaNodeName }MutateRequestItemInsertProps
 * @typedef { object } ${ schemaNodeName }MutateRequestItemInsertPropsTemp
 * @property { string | number } [ id ] - If you are setting your own **id**, it must be a unique **id** to all other relationships or nodes in your graph. If you are allowing Ace to set this id, it must look like this **_:chris** - The beginning must have the id prefix which is **_:** and the end must have a unique identifier string, this way you can reuse this id in other mutations`

      typedefs.mutate.NodeUpdateTypes += `\n *
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeUpdate
 * @property { typeof enums.aceDo.NodeUpdate } do - Update Node
 * @property { ${ schemaNodeName }MutateRequestItemNodeUpdateHow } how
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeUpdateHow
 * @property { '${ schemaNodeName }' } node - Update **${ schemaNodeName }** node
 * @property { ${ schemaNodeName }MutateRequestUpdateItemProps } props
 * @property { AceMutateRequestOptions } [ $o ] - Mutation update options
 * @typedef { ${ schemaNodeName }MutateRequestUpdateItemPropsTemp & { [propName: string]: any } } ${ schemaNodeName }MutateRequestUpdateItemProps
 * @typedef { object } ${ schemaNodeName }MutateRequestUpdateItemPropsTemp
 * @property { string | number } id - The node's unique identifier`

      typedefs.mutate.NodeUpsertTypes += `\n *
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeUpsert
 * @property { typeof enums.aceDo.NodeUpsert } do - Upsert Node
 * @property { ${ schemaNodeName }MutateRequestItemNodeUpsertHow } how
 * @typedef { object } ${ schemaNodeName }MutateRequestItemNodeUpsertHow
 * @property { '${ schemaNodeName }' } node - Upsert **${ schemaNodeName }** node
 * @property { ${ schemaNodeName }MutateRequestUpsertItemProps } props
 * @property { AceMutateRequestOptions } [ $o ] - Mutation upsert options
 * @typedef { ${ schemaNodeName }MutateRequestUpdateItemPropsTemp & { [propName: string]: any } } ${ schemaNodeName }MutateRequestUpsertItemProps
 * @typedef { object } ${ schemaNodeName }MutateRequestUpsertItemPropsTemp
 * @property { string | number } id - The node's unique identifier`

      for (const schemaNodePropName in schema.nodes[schemaNodeName]) {
        if (schemaNodePropName !== schemaId) {
          const schemaProp = schema.nodes[schemaNodeName][schemaNodePropName]

          typedefs.mutate.SchemaDeleteNodePropsType += `{ node: '${ schemaNodeName }', prop: '${ schemaNodePropName }' } | `
          typedefs.mutate.SchemaRenameNodePropType += `{ node: '${ schemaNodeName }', nowName: '${ schemaNodePropName }', newName: string } | `
          typedefs.mutate.SchemaUpdatePropMustBeDefinedType += `{ nodeOrRelationship: '${ schemaNodeName }', prop: '${ schemaNodePropName }', mustBeDefined: boolean } | `

          switch (schemaProp.is) {
            case 'Prop':
              const dataType = getDataType(schemaProp.options.dataType)
              typedefs.Nodes += `\n * @property { ${ dataType } } [ ${ schemaNodePropName } ] ${ schemaProp.options.description || '' }`
              typedefs.mutate.NodeInsertTypes += `\n * @property { ${ dataType } } ${ schemaProp.options.mustBeDefined && typeof schemaProp.options.default === 'undefined' ? schemaNodePropName : '[ ' + schemaNodePropName + ' ]'} - Set to a value with a **${ dataType }** data type to set the current **${ schemaNodePropName }** property in the graph for this node (**${ schemaNodeName }**). ${ schemaProp.options.description || '' }`
              typedefs.mutate.NodeUpdateTypes += `\n * @property { ${ dataType } } [ ${ schemaNodePropName } ] - Set to a value with a **${ dataType }** data type to update the current **${ schemaNodePropName }** property in the graph for this node (**${ schemaNodeName }**). ${ schemaProp.options.description || '' }`
              typedefs.mutate.NodeUpsertTypes += `\n * @property { ${ dataType } } [ ${ schemaNodePropName } ] - Set to a value with a **${ dataType }** data type to upsert the current **${ schemaNodePropName }** property in the graph for this node (**${ schemaNodeName }**). ${ schemaProp.options.description || '' }`
              typedefs.query.NodeProps += `\n * @property { AceQueryResValuePropValue } [ ${ schemaNodePropName } ] - ${ getQueryPropDescription({ propName: schemaNodePropName, nodeName: schemaNodeName, schemaPropDescription: schemaProp.options.description }) }`
              typedefs.mutate.SchemaUpdatePropDefaultType += `{ nodeOrRelationship: '${ schemaNodeName }', prop: '${ schemaNodePropName }', default?: any } | `
              typedefs.mutate.SchemaUpdatePropSortIndexType += `{ nodeOrRelationship: '${ schemaNodeName }', prop: '${ schemaNodePropName }', sortIndex: boolean } | `
              typedefs.mutate.SchemaUpdatePropUniqueIndexType += `{ nodeOrRelationship: '${ schemaNodeName }', prop: '${ schemaNodePropName }', uniqueIndex: boolean } | `
              break
            case 'ForwardRelationshipProp':
            case 'ReverseRelationshipProp':
            case 'BidirectionalRelationshipProp':
              const relationshipMapValue = relationshipMap.get(schemaProp.options.relationship) || []

              relationshipMapValue.push({ schemaNodeName, schemaNodePropName, schemaProp })
              relationshipMap.set(schemaProp.options.relationship, relationshipMapValue)

              typedefs.Nodes += `\n * @property { ${ schemaProp.options.node }${ schemaProp.options.has === 'many' ? '[]' : '' } } [ ${ schemaNodePropName } ]`
              typedefs.mutate.SchemaUpdateNodePropHasType += `{ node: '${ schemaNodeName }', prop: '${ schemaNodePropName }', has: enums.schemaHas } | `
              typedefs.mutate.SchemaUpdateNodePropCascadeType += `{ node: '${ schemaNodeName }', prop: '${ schemaNodePropName }', cascade: boolean } | `

              let queryProps = ''

              for (const relationshipNodePropName in schema.nodes[schemaProp.options.node]) {
                if (relationshipNodePropName !== schemaId) {
                  const rSchemaProp = schema.nodes[schemaProp.options.node][relationshipNodePropName]

                  queryProps += rSchemaProp.is === 'Prop' ?
                    `\n * @property { AceQueryResValuePropValue } [ ${ relationshipNodePropName } ] - ${ getQueryPropDescription({ propName: relationshipNodePropName, nodeName: schemaProp.options.node, schemaPropDescription: rSchemaProp.options.description }) }` :
                    `\n * @property { AceQueryCount | AceQueryStars | ${ getNodePropResValue(schemaProp.options.node, relationshipNodePropName) } } [ ${ relationshipNodePropName} ] - ${ getRelationshipQueryPropDescription(schemaProp.options.node, relationshipNodePropName, rSchemaProp) }`
                }
              }

              if (schema.relationships?.[schemaProp.options.relationship]?.props) {
                const props = schema.relationships?.[schemaProp.options.relationship].props

                for (const relationshipPropName in props) {
                  queryProps += `\n * @property { AceQueryResValuePropValue } [ ${ relationshipPropName} ] - ${getQueryPropDescription({ propName: relationshipPropName, relationshipName: schemaProp.options.relationship, schemaPropDescription: props[relationshipPropName].options.description })}`
                }
              }

              const relationshipPropName = getNodePropResValue(schemaNodeName, schemaNodePropName)

              typedefs.query.NodeProps += `\n * @property { AceQueryCount | AceQueryStars | ${ relationshipPropName } } [ ${ schemaNodePropName } ] - ${ getRelationshipQueryPropDescription(schemaNodeName, schemaNodePropName, schemaProp) }`

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
      }

      if (!typedefs.query.Nodes) typedefs.query.Nodes += `\n\n\n/** Query: Node's (from schema)\n`

      typedefs.query.Nodes +=` *
 * @typedef { object } ${ schemaNodeName }QueryRequestItemNode
 * @property { typeof enums.aceDo.NodeQuery } do
 * @property { ${ schemaNodeName }QueryRequestItemNodeHow } how
 * @typedef { object } ${ schemaNodeName }QueryRequestItemNodeHow
 * @property { '${ schemaNodeName }' } node
 * @property { string } resKey
 * @property { AceQueryCount | AceQueryStars | ${ schemaNodeName }QueryRequestItemNodeResValue } resValue
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
      typedefs.mutate.SchemaDeleteRelationshipsType += `'${ schemaRelationshipName }' | `
      typedefs.query.RelationshipPipes += `${ schemaRelationshipName }QueryRequestItemRelationship | `
      typedefs.mutate.RelationshipInsertPipes += `${ schemaRelationshipName }MutateRequestItemRelationshipInsert | `
      typedefs.mutate.RelationshipUpdatePipes += `${ schemaRelationshipName }MutateRequestItemRelationshipUpdate | `
      typedefs.mutate.RelationshipUpsertPipes += `${ schemaRelationshipName }MutateRequestItemRelationshipUpsert | `
      typedefs.Relationships += `\n * @typedef { object } ${ schemaRelationshipName }\n * @property { string } [ id ]`
      typedefs.mutate.SchemaRenameRelationshipType += `{ nowName: '${ schemaRelationshipName }', newName: string } | `
      typedefs.mutate.RelationshipInsertPropsTypes += `${ schemaRelationshipName }MutateRequestItemRelationshipInsertProps | `
      typedefs.mutate.RelationshipUpdatePropsTypes += `${ schemaRelationshipName }MutateRequestItemRelationshipUpdateProps | `
      typedefs.mutate.RelationshipUpsertPropsTypes += `${ schemaRelationshipName }MutateRequestItemRelationshipUpsertProps | `
      typedefs.mutate.RelationshipInUpProps += `${ schemaRelationshipName }MutateRequestItemRelationshipInsertProps | ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateProps | ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertProps | `

      const abDescription = `**a** and **b** are node ids, so for examle if **a** is **_:node1** and **b** is **_:node2** then, **_:node1** => **${ schemaRelationshipName }** => **_:node2**`

      typedefs.mutate.RelationshipInsertTypes += `\n *
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipInsert
 * @property { typeof enums.aceDo.RelationshipInsert } do - Insert Relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipInsertHow } how
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipInsertHow
 * @property { '${ schemaRelationshipName }' } relationship - Insert **${ schemaRelationshipName }** relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipInsertProps } props
 * @property { AceMutateRequestOptions } [ $o ] - Mutation insert options
 * @typedef { ${ schemaRelationshipName }MutateRequestItemRelationshipInsertPropsTemp & { [propName:string]: any  } } ${ schemaRelationshipName }MutateRequestItemRelationshipInsertProps
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipInsertPropsTemp
 * @property { string | number } a - ${ abDescription }
 * @property { string | number } b - ${ abDescription }`

      typedefs.mutate.RelationshipUpdateTypes += `\n *
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipUpdate
 * @property { typeof enums.aceDo.RelationshipUpdate } do - Update Relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateHow } how
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateHow
 * @property { '${ schemaRelationshipName }' } relationship - Update **${ schemaRelationshipName }** relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateProps } props
 * @property { AceMutateRequestOptions } [ $o ] - Mutation update options
 * @typedef { ${ schemaRelationshipName }MutateRequestItemRelationshipUpdatePropsTemp & { [propName:string]: any  } } ${ schemaRelationshipName }MutateRequestItemRelationshipUpdateProps
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipUpdatePropsTemp
 * @property { string | number } _id - The relationship _id you would love to update
 * @property { string | number } [ a ] - ${ abDescription }
 * @property { string | number } [ b ] - ${ abDescription }`

      typedefs.mutate.RelationshipUpsertTypes += `\n *
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipUpsert
 * @property { typeof enums.aceDo.RelationshipUpsert } do - Upsert Relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertHow } how
 * @typedef { object } ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertHow
 * @property { '${ schemaRelationshipName }' } relationship - Upsert **${ schemaRelationshipName }** relationship
 * @property { ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertProps } props
 * @property { AceMutateRequestOptions } [ $o ] - Mutation upsert options
 * @typedef { ${schemaRelationshipName }MutateRequestItemRelationshipUpsertPropsTemp & { [propName:string]: any  } } ${ schemaRelationshipName }MutateRequestItemRelationshipUpsertProps
 * @typedef { object } ${schemaRelationshipName }MutateRequestItemRelationshipUpsertPropsTemp
 * @property { string | number } _id - The relationship _id you would love to upsert
 * @property { string | number } [ a ] - ${ abDescription }
 * @property { string | number } [ b ] - ${ abDescription }`

      if (schema.relationships[schemaRelationshipName]?.props) {
        for (const schemaRelationshipPropName in schema.relationships[schemaRelationshipName].props) {
          const schemaProp = schema.relationships[schemaRelationshipName].props[schemaRelationshipPropName]
          const dataType = getDataType(schemaProp.options.dataType)
          const description = `Set to a ${ dataType } value if you would love to update this relationship property, **${ schemaRelationshipPropName }**, in the graph`

          typedefs.Relationships += `\n * @property { ${ dataType } } [ ${ schemaRelationshipPropName } ] ${ schemaProp.options.description || '' }`
          typedefs.mutate.RelationshipUpdateTypes += `\n * @property { ${ dataType } } ${ '[ ' + schemaRelationshipPropName + ' ]' } - ${ description }`
          typedefs.mutate.RelationshipUpsertTypes += `\n * @property { ${ dataType } } ${ '[ ' + schemaRelationshipPropName + ' ]' } - ${ description }`
          typedefs.mutate.SchemaDeleteRelationshipPropsType += `{ relationship: '${ schemaRelationshipName }', prop: '${ schemaRelationshipPropName }' } | `
          typedefs.mutate.SchemaUpdatePropDefaultType += `{ nodeOrRelationship: '${ schemaRelationshipName }', prop: '${ schemaRelationshipPropName }', default?: any } | `
          typedefs.mutate.SchemaRenameRelationshipPropType += `{ relationship: '${ schemaRelationshipName }', nowName: '${ schemaRelationshipPropName }', newName: string } | `
          typedefs.mutate.SchemaUpdatePropSortIndexType += `{ nodeOrRelationship: '${ schemaRelationshipName }', prop: '${ schemaRelationshipPropName }', sortIndex: boolean } | `
          typedefs.mutate.SchemaUpdatePropUniqueIndexType += `{ nodeOrRelationship: '${ schemaRelationshipName }', prop: '${ schemaRelationshipPropName }', uniqueIndex: boolean } | `
          typedefs.mutate.SchemaUpdatePropMustBeDefinedType += `{ nodeOrRelationship: '${ schemaRelationshipName }', prop: '${ schemaRelationshipPropName }', mustBeDefined: boolean } | `
          typedefs.mutate.RelationshipInsertTypes += `\n * @property { ${ dataType } } ${ schemaProp.options.mustBeDefined && typeof schemaProp.options.default === 'undefined' ? schemaRelationshipPropName : '[ ' + schemaRelationshipPropName + ' ]' } - ${ description }`
          typedefs.query.RelationshipProps += `\n * @property { AceQueryResValuePropValue } [ ${ schemaRelationshipPropName } ] - ${ getQueryPropDescription({ propName: schemaRelationshipPropName, relationshipName: schemaRelationshipName, schemaPropDescription: schemaProp.options.description }) }`
        }
      }

      const relationshipMapValue = relationshipMap.get(schemaRelationshipName)

      if (relationshipMapValue) {
        for (const { schemaNodeName, schemaNodePropName, schemaProp } of relationshipMapValue) {
          typedefs.query.RelationshipProps += `\n * @property { AceQueryCount | AceQueryStars | ${ getNodePropResValue(schemaNodeName, schemaNodePropName) } } [ ${ schemaNodePropName } ] - ${ getRelationshipQueryPropDescription(schemaNodeName, schemaNodePropName, schemaProp) }`
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
 * @property { AceQueryCount | AceQueryStars | ${ schemaRelationshipName }QueryRequestItemRelationshipResValue } resValue
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
  if (typedefs.mutate.NodeInsertPropsTypes) typedefs.mutate.NodeInsertPropsTypes = typedefs.mutate.NodeInsertPropsTypes.slice(0, -3)
  if (typedefs.mutate.NodeUpdatePropsTypes) typedefs.mutate.NodeUpdatePropsTypes = typedefs.mutate.NodeUpdatePropsTypes.slice(0, -3)
  if (typedefs.mutate.NodeUpsertPropsTypes) typedefs.mutate.NodeUpsertPropsTypes = typedefs.mutate.NodeUpsertPropsTypes.slice(0, -3)
  if (typedefs.mutate.RelationshipInUpProps) typedefs.mutate.RelationshipInUpProps = typedefs.mutate.RelationshipInUpProps.slice(0, -3)
  if (typedefs.mutate.SchemaDeleteNodesType) typedefs.mutate.SchemaDeleteNodesType = typedefs.mutate.SchemaDeleteNodesType.slice(0, -3)
  if (typedefs.mutate.RelationshipInsertPipes) typedefs.mutate.RelationshipInsertPipes = typedefs.mutate.RelationshipInsertPipes.slice(0, -3)
  if (typedefs.mutate.RelationshipUpdatePipes) typedefs.mutate.RelationshipUpdatePipes = typedefs.mutate.RelationshipUpdatePipes.slice(0, -3)
  if (typedefs.mutate.RelationshipUpsertPipes) typedefs.mutate.RelationshipUpsertPipes = typedefs.mutate.RelationshipUpsertPipes.slice(0, -3)
  if (typedefs.mutate.SchemaRenameNodeType) typedefs.mutate.SchemaRenameNodeType = typedefs.mutate.SchemaRenameNodeType.slice(0, -3)
  if (typedefs.mutate.SchemaDeleteNodePropsType) typedefs.mutate.SchemaDeleteNodePropsType = typedefs.mutate.SchemaDeleteNodePropsType.slice(0, -3)
  if (typedefs.mutate.SchemaUpdateNodePropHasType) typedefs.mutate.SchemaUpdateNodePropHasType = typedefs.mutate.SchemaUpdateNodePropHasType.slice(0, -3)
  if (typedefs.mutate.SchemaUpdatePropDefaultType) typedefs.mutate.SchemaUpdatePropDefaultType = typedefs.mutate.SchemaUpdatePropDefaultType.slice(0, -3)
  if (typedefs.mutate.RelationshipInsertPropsTypes) typedefs.mutate.RelationshipInsertPropsTypes = typedefs.mutate.RelationshipInsertPropsTypes.slice(0, -3)
  if (typedefs.mutate.RelationshipUpdatePropsTypes) typedefs.mutate.RelationshipUpdatePropsTypes = typedefs.mutate.RelationshipUpdatePropsTypes.slice(0, -3)
  if (typedefs.mutate.RelationshipUpsertPropsTypes) typedefs.mutate.RelationshipUpsertPropsTypes = typedefs.mutate.RelationshipUpsertPropsTypes.slice(0, -3)
  if (typedefs.mutate.SchemaRenameNodePropType) typedefs.mutate.SchemaRenameNodePropType = typedefs.mutate.SchemaRenameNodePropType.slice(0, -3)
  if (typedefs.mutate.SchemaUpdatePropSortIndexType) typedefs.mutate.SchemaUpdatePropSortIndexType = typedefs.mutate.SchemaUpdatePropSortIndexType.slice(0, -3)
  if (typedefs.mutate.SchemaDeleteRelationshipsType) typedefs.mutate.SchemaDeleteRelationshipsType = typedefs.mutate.SchemaDeleteRelationshipsType.slice(0, -3)
  if (typedefs.mutate.SchemaUpdateNodePropCascadeType) typedefs.mutate.SchemaUpdateNodePropCascadeType = typedefs.mutate.SchemaUpdateNodePropCascadeType.slice(0, -3)
  if (typedefs.mutate.SchemaUpdatePropUniqueIndexType) typedefs.mutate.SchemaUpdatePropUniqueIndexType = typedefs.mutate.SchemaUpdatePropUniqueIndexType.slice(0, -3)
  if (typedefs.mutate.SchemaRenameRelationshipType) typedefs.mutate.SchemaRenameRelationshipType = typedefs.mutate.SchemaRenameRelationshipType.slice(0, -3)
  if (typedefs.mutate.SchemaDeleteRelationshipPropsType) typedefs.mutate.SchemaDeleteRelationshipPropsType = typedefs.mutate.SchemaDeleteRelationshipPropsType.slice(0, -3)
  if (typedefs.mutate.SchemaUpdatePropMustBeDefinedType) typedefs.mutate.SchemaUpdatePropMustBeDefinedType = typedefs.mutate.SchemaUpdatePropMustBeDefinedType.slice(0, -3)
  if (typedefs.mutate.SchemaRenameRelationshipPropType) typedefs.mutate.SchemaRenameRelationshipPropType = typedefs.mutate.SchemaRenameRelationshipPropType.slice(0, -3)

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
 * @property { AceQueryCount | AceQueryStars | AceQueryRequestItemNodeResValue } resValue`
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
 * @property { AceQueryCount | AceQueryStars | AceQueryRequestItemRelationshipResValue } resValue`
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
 * @property { AceMutateRequestOptions } [ $o ]`
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
 * @property { AceMutateRequestOptions } [ $o ]`
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
 * @property { AceMutateRequestOptions } [ $o ]`
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
 * @property { AceMutateRequestOptions } [ $o ]`
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
 * @property { AceMutateRequestOptions } [ $o ]`
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
 * @property { AceMutateRequestOptions } [ $o ]`
  })

  return typedefs
}


/**
 * @param { string } dataType 
 * @returns { string }
 */
function getDataType (dataType) {
  switch (dataType) {
    case 'iso':
    case 'hash':
    case 'encrypt':
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
  return nodeName + delimiter + propName + delimiter + 'ResValue'
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
