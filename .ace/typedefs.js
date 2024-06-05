import * as enums from './enums.js'


/** AceMemory
 *
 * @typedef { object } AceMemory
 * @prop { AceQueueItem[] } queue
 * @prop { AceTxn } txn
 * @prop { AceMemoryWal } wal
 *
 * @typedef { object } AceMemoryWal
 * @prop { number } byteAmount - number of bytes in the map
 * @prop { number } [ fileSize ] - filehandle.stat() on the wal file
 * @prop { Map<string | number, { do: enums.writeDo, value: any }> } map
 * @prop { import('node:fs/promises').FileHandle } [ filehandle ]
 * @prop { { byteAmount: number, map: Map<string | number, any> } } revert
 *
 * @typedef { [ string | number, number, number, number ] } AceMemoryMiniIndexItem
 */


/** AceFile
 *
 * @typedef { ('dir' | 'trash' | 'graphs' | 'schemas' | 'wal' | 'trashNow')[] } AceFileInitPathsTypes
 * @typedef { ('dir' | 'wal' | 'trash' | 'graphs' | 'schemas' | 'schemaDetails' | 'trashNow' | 'trashNowWal'  | 'trashNowGraphs' | 'trashNowSchemas')[] } AceFileGetPathsTypes
 * @typedef { { dir: string, wal: string, trash: string, graphs: string, schemas: string, schemaDetails: string, trashNow: string, trashNowWal: string, trashNowGraphs: string, trashNowSchemas: string } } AceFilePaths
 */


/** AceGraph
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
 * @property { string } [ env ]
 * @property { NodeJS.Timeout } [ timeoutId ]
 * @property { enums.txnSteps } step
 * @property { AceSchema | null } schema
 * @property { AceTxnSchemaDataStructures } schemaDataStructures
 * @property { boolean } schemaUpdated
 * @property { AceSchemaDetails } [ schemaNowDetails ]
 * @property { AceSchemaDetails } [ schemaOriginalDetails ]
 * @property { number } [ lastId ]
 * @property { boolean } hasUpdates
 * @property { string } [ emptyTimestamp ]
 * @property { Map<string | number, number> } enumGraphIdsMap
 * @property { Map<string | number, { do: enums.writeDo, value: * }> } writeMap
 * @property { string } writeStr
 * @property { Map<string, { propName: string, newIds: (string | number)[] }> } sortIndexMap - If we add a node and prop and that node+prop has a sort index, put the newly created nodes in here
 * 
 * @typedef { object } AceTxnSchemaDataStructures
 * @property { Map<string, AceTxnSchemaDataStructuresDefaultItem[]> } defaults
 * @property { Map<string, Set<string>> } cascade
 * @property { Map<string, Set<string>> } nodeRelationshipPropsMap
 * @property { Map<string, string> } nodeNamePlusRelationshipNameToNodePropNameMap
 * @property { Map<string, Map<string, { propNode: string, propValue: AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp }>> } relationshipPropsMap
 * @property { Map<string, Map<string, (AceSchemaProp | AceSchemaRelationshipProp | AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp)>> } mustPropsMap
 *
 * @typedef { object } AceTxnSchemaDataStructuresDefaultItem
 * @property { string } prop
 * @property { any } [ value ]
 * @property { 'setIsoNow' } [ do ]
 */


/** AceFn Return Type
 * @template { AceFnOptions } T
 * @typedef { T['txn'] extends AceFnOptionsTxnStart ? AceFnTxnStartResponse : T['txn'] extends AceFnOptionsTxnCancel ? AceFnTxnCancelResponse : T['txn'] extends AceFnOptionsTxnComplete ? AceFnTxnCompleteResponse : T['txn'] extends AceFnOptionsTxnContinue ? AceFnTxnContinueResponse : AceFnNoTxnResponse } AceResponse
 */


/** AceFn
 *
 * @typedef { object } AceFnOptions
 * @property { string } path - Path of graph file relative to your package.json file
 * @property { string } env - Your process.env.NODE_ENV. Env allows different schema versions in different environments (eg: local, qa, production)
 * @property { AceFnRequest } [ req ]
 * @property { AceFnOptionsTxn } [ txn ]
 * @property { AceFnStringJWKs } [ jwks ]
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
 * @typedef { { [prop: string]: any } & { $ace: AceFn$Default & { txnId: string, txnStarted: true } } } AceFnTxnStartResponse
 * @typedef { { [prop: string]: any } & { $ace: AceFn$Default & { txnId: string, txnCancelled: true } } } AceFnTxnCancelResponse
 * @typedef { { [prop: string]: any } & { $ace: AceFn$Default & { txnId: string, txnCompleted: true } } } AceFnTxnCompleteResponse
 * @typedef { { [prop: string]: any } & { $ace: AceFn$Default & { txnId: string } } } AceFnTxnContinueResponse
 * @typedef { { [prop: string]: any } & { $ace?: AceFn$Default } } AceFnNoTxnResponse
 *
 * @typedef { AceQueryRequestItem | AceMutateRequestItem } AceFnRequestItem
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
 * @typedef { { [env: string]: { lastCreatedVersion: number, currentVersion: number } } } AceSchemaDetails
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
 * @property { typeof enums.aceDo.Empty } do - Delete schema and all datamfrom graph
 *
 * @typedef { object } AceMutateRequestItemNodeInsert
 * @property { typeof enums.aceDo.NodeInsert } do
 * @property { AceMutateRequestItemNodeInsertHow } how
 * @typedef { object } AceMutateRequestItemNodeInsertHow
 * @property { string } node
 * @property { AceMutateRequestItemNodeInsertProps } props
 * @property { AceMutateRequestOptions } [ $o ]
 *
 * @typedef { object } AceMutateRequestItemRelationshipInsert
 * @property { typeof enums.aceDo.RelationshipInsert } do
 * @property { AceMutateRequestItemRelationshipInsertHow } how
 * @typedef { object } AceMutateRequestItemRelationshipInsertHow
 * @property { string } relationship
 * @property { AceMutateRequestItemRelationshipInsertProps } props
 * @property { AceMutateRequestOptions } [ $o ]
 *
 * @typedef { object } AceMutateRequestItemNodeUpdate
 * @property { typeof enums.aceDo.NodeUpdate } do
 * @property { AceMutateRequestItemNodeUpdateHow } how
 * @typedef { object } AceMutateRequestItemNodeUpdateHow
 * @property { string } node
 * @property { AceMutateRequestItemNodeUpdateProps } props
 * @property { AceMutateRequestOptions } [ $o ]
 *
 * @typedef { object } AceMutateRequestItemRelationshipUpdate
 * @property { typeof enums.aceDo.RelationshipUpdate } do
 * @property { AceMutateRequestItemRelationshipUpdateHow } how
 * @typedef { object } AceMutateRequestItemRelationshipUpdateHow
 * @property { string } relationship
 * @property { AceMutateRequestItemRelationshipUpdateProps } props
 * @property { AceMutateRequestOptions } [ $o ]
 *
 * @typedef { object } AceMutateRequestItemNodeUpsert
 * @property { typeof enums.aceDo.NodeUpsert } do
 * @property { AceMutateRequestItemNodeUpsertHow } how
 * @typedef { object } AceMutateRequestItemNodeUpsertHow
 * @property { string } node
 * @property { AceMutateRequestItemNodeUpsertProps } props
 * @property { AceMutateRequestOptions } [ $o ]
 *
 * @typedef { object } AceMutateRequestItemRelationshipUpsert
 * @property { typeof enums.aceDo.RelationshipUpsert } do
 * @property { AceMutateRequestItemRelationshipUpsertHow } how
 * @typedef { object } AceMutateRequestItemRelationshipUpsertHow
 * @property { string } relationship
 * @property { AceMutateRequestItemRelationshipUpsertProps } props
 * @property { AceMutateRequestOptions } [ $o ]
 * 
 * @typedef { AceMutateRequestItemRelationshipInsert | AceMutateRequestItemRelationshipUpdate | AceMutateRequestItemRelationshipUpsert } AceMutateRequestItemRelationshipInup
 * 
 * @typedef { AceMutateRequestItemNodeUpdate & { [relationshipProp: string]: string[] } } AceMutateRequestItemNodeWithRelationships
 * 
 * @typedef { object } AceMutateRequestItemNodeDeleteData
 * @property { typeof enums.aceDo.NodeDeleteData } do
 * @property { (string | number)[] } how - The ids you'd love deleted. To cascade delete, add cascade to the schema
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
 * @typedef { string } AceMutateRequestItemNodeDeleteDataAndDeleteFromSchemaNode
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
 * @property { { node: string, prop: string }[] } props
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodeName
 * @property { typeof enums.aceDo.SchemaUpdateNodeName } do
 * @property { AceMutateRequestItemSchemaUpdateNodeNameHow } how
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodeNameHow
 * @property { { nowName: string, newName: string }[] } nodes
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodePropName
 * @property { typeof enums.aceDo.SchemaUpdateNodePropName } do
 * @property { AceMutateRequestItemSchemaUpdateNodePropNameHow } how
 * @typedef { object } AceMutateRequestItemSchemaUpdateNodePropNameHow
 * @property { { node: string, nowName: string, newName: string }[] } props
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateRelationshipName
 * @property { typeof enums.aceDo.SchemaUpdateRelationshipName } do
 * @property { AceMutateRequestItemSchemaUpdateRelationshipNameHow } how
 * @typedef { object } AceMutateRequestItemSchemaUpdateRelationshipNameHow
 * @property { { nowName: string, newName: string }[] } relationships
 *
 * @typedef { object } AceMutateRequestItemSchemaUpdateRelationshipPropName
 * @property { typeof enums.aceDo.SchemaUpdateRelationshipPropName } do
 * @property { AceMutateRequestItemSchemaUpdateRelationshipPropNameHow } how
 * @typedef { object } AceMutateRequestItemSchemaUpdateRelationshipPropNameHow
 * @property { { relationship: string, nowName: string, newName: string }[] } props
 *
 * @typedef { object } AceMutateRequestItemSchemaAdd
 * @property { typeof enums.aceDo.SchemaAdd } do
 * @property { AceSchemaAddition } how
 *
 * @typedef { object } AceMutateRequestOptions
 * @property { string } [ privateJWK ]
 *
 * @typedef { { id?: string | number, [propName: string]: any } } AceMutateRequestItemNodeInsertProps
 * @typedef { { id: string | number, [propName: string]: any } } AceMutateRequestItemNodeUpdateProps
 * @typedef { { id: string | number, [propName: string]: any } } AceMutateRequestItemNodeUpsertProps
 *
 * @typedef { { a: string, b: string, [propName: string]: any } } AceMutateRequestItemRelationshipInsertProps
 * @typedef { { id: string | number, a: string, b: string, [propName: string]: any } } AceMutateRequestItemRelationshipUpdateProps
 * @typedef { { id: string | number, a: string, b: string, [propName: string]: any } } AceMutateRequestItemRelationshipUpsertProps
 * 
 * @typedef { AceMutateRequestItemRelationshipInsertProps | AceMutateRequestItemRelationshipUpdateProps | AceMutateRequestItemRelationshipUpsertProps } AceMutateRequestItemRelationshipInUpProps
 */


/** AceQuery
 * 
 * @typedef { object } AceQueryRequestItemNode
 * @property { typeof enums.aceDo.NodeQuery } do
 * @property { AceQueryRequestItemNodeHow } how
 * @typedef { object } AceQueryRequestItemNodeHow
 * @property { string } node
 * @property { string } resKey
 * @property { AceQueryStars | AceQueryRequestItemNodeResValue } resValue
 *
 * @typedef { object } AceQueryRequestItemRelationship
 * @property { typeof enums.aceDo.RelationshipQuery } do
 * @property { AceQueryRequestItemRelationshipHow } how
 * @typedef { object } AceQueryRequestItemRelationshipHow
 * @property { string } relationship
 * @property { string } resKey
 * @property { AceQueryStars | AceQueryRequestItemRelationshipResValue } resValue
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
*/  


/** AceBackup
 *
 * @typedef { { [k: string]: any }  } AceBackupResponse
 */


/** AcePromise
 * 
 * @typedef { (reason?: any) => void  } AcePromiseReject
 */
