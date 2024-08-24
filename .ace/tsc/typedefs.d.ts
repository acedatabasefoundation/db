/**
 * AceGraph
 */
export type AceGraphValue = string | number | boolean | (string | number)[] | number[];
/**
 * AceGraph
 */
export type AceGraphIndex = {
    $aK: string;
    $aA: enums.writeAction;
    index: string | number | (string | number)[] | number[];
};
/**
 * AceGraph
 */
export type AceGraphLastKey = {
    $aK: "$ace___last___id";
    $aA: enums.writeAction;
    value: number;
};
/**
 * AceGraph
 */
export type AceGraphNode = {
    $aK: number;
    $aA: enums.writeAction;
    $aN: string;
    [propName: string]: any;
};
/**
 * AceGraph
 */
export type AceGraphRelationship = {
    $aK: number;
    $aA: enums.writeAction;
    $aR: string;
    a: (string | number);
    b: (string | number);
    [propName: string]: any;
};
/**
 * AceGraph
 */
export type AceGraphDelete = {
    $aK: string | number;
    $aA: typeof enums.writeAction.delete;
};
/**
 * AceGraph
 */
export type AceGraphItem = AceGraphNode | AceGraphRelationship | AceGraphIndex | AceGraphLastKey | AceGraphDelete;
/**
 * AceGraph
 */
export type AceGraphIndexSearchRes = null | {
    match: number;
    start?: never;
} | {
    start: number;
    match?: never;
};
/**
 * AceMemory
 */
export type AceMemory = {
    queue: AceQueueItem[];
    txn: AceTxn;
    aol: AceMemoryAol;
    collator: Intl.Collator;
};
/**
 * AceMemory
 */
export type AceMemoryAol = {
    /**
     * - filehandle.stat() on the aol file
     */
    ogFileSize: number | null;
    /**
     * - the new file size after an append
     */
    nowFileSize: number | null;
    array: AceGraphItem[];
    filehandle?: import("fs/promises").FileHandle | undefined;
};
/**
 * AceTxn
 */
export type AceTxn = {
    id?: string | undefined;
    env?: string | undefined;
    timeoutId?: NodeJS.Timeout | undefined;
    step: enums.txnSteps;
    schema: AceSchema | null;
    schemaDataStructures: AceTxnSchemaDataStructures;
    schemaUpdated?: boolean | undefined;
    schemaPushRequested?: boolean | undefined;
    schemaPushRequestedThenSchemaUpdated?: boolean | undefined;
    schemaNowDetails?: AceSchemaDetails | undefined;
    schemaOriginalDetails?: AceSchemaDetails | undefined;
    startGraphId: number | null;
    lastGraphId: number | null;
    hasUpdates?: boolean | undefined;
    emptyTimestamp?: string | undefined;
    enumGraphIds: Map<string, number>;
    writeArray: AceGraphItem[];
    /**
     * - If we add a node and prop and that node+prop has a sort index, put the newly created nodes in here
     */
    sortIndexMap: Map<string, {
        schemaProp: AceSchemaProp | AceSchemaRelationshipProp;
        nodeOrRelationshipName: string;
        propName: string;
        newIds: (string | number)[];
    }>;
    paths?: AceFilePaths | undefined;
};
/**
 * AceTxn
 */
export type AceTxnSchemaDataStructures = {
    defaults: Map<string, AceTxnSchemaDataStructuresDefaultItem[]>;
    nodeRelationshipPropsMap: Map<string, Map<string, {
        node: string;
        prop: string;
        relationship: string;
    }>>;
    byAceId: Map<number, {
        node?: string;
        relationship?: string;
        prop?: string;
    }>;
    relationshipPropsMap: Map<string, Map<string, {
        propNode: string;
        propValue: AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp;
    }>>;
    mustPropsMap: Map<string, Map<string, (AceSchemaProp | AceSchemaRelationshipProp | AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp)>>;
};
/**
 * AceTxn
 */
export type AceTxnSchemaDataStructuresDefaultItem = {
    prop: string;
    value?: any;
    do?: "setIsoNow" | undefined;
};
/**
 * AceQueue
 */
export type AceQueueItem = {
    resolve: (res: AceFnResponse) => void;
    reject: AcePromiseReject;
    options: AceFnOptions;
};
/**
 * - Just a typical node file handle: `import('node:fs/promises').FileHandle` just does the import once
 */
export type AceFileHandle = import("node:fs/promises").FileHandle;
/**
 * AceFile
 */
export type AceFileInitPathsTypes = ("dir" | "trash" | "graphs" | "graphDetails" | "schemas" | "aol" | "trashNow")[];
/**
 * AceFile
 */
export type AceFileGetPathsTypes = ("dir" | "aol" | "trash" | "graphs" | "graphDetails" | "schemas" | "schemaDetails" | "trashNow" | "trashNowAol" | "trashNowGraphs" | "trashNowSchemas")[];
/**
 * AceFile
 */
export type AceFilePaths = {
    dir: string;
    aol: string;
    trash: string;
    graphs: string;
    graphDetails: string;
    schemas: string;
    schemaDetails: string;
    trashNow?: string;
    trashNowAol?: string;
    trashNowGraphs?: string;
    trashNowSchemas?: string;
};
/**
 * AceFn
 */
export type AceFnOptions = {
    /**
     * - Directory that holds graph information, relative to your package.json file
     */
    dir: string;
    /**
     * - Your process.env.NODE_ENV. Env allows different schema versions in different environments (eg: local, qa, production)
     */
    env: string;
    req?: AceFnRequest | undefined;
    txn?: AceFnOptionsTxn | undefined;
    jwks?: AceFnStringJWKs | undefined;
    ivs?: AceFnIVs | undefined;
};
/**
 * AceFn
 */
export type AceFnOptionsTxn = AceFnOptionsTxnStart | AceFnOptionsTxnComplete | AceFnOptionsTxnCancel | AceFnOptionsTxnContinue;
/**
 * AceFn
 */
export type AceFnOptionsTxnStart = {
    do: typeof enums.txnDo.Start;
    /**
     * - Max number of seconds this transaction can be pending before Ace cancels it. The default is 9 seconds.
     */
    maxSeconds?: number | undefined;
    id?: undefined;
};
/**
 * AceFn
 */
export type AceFnOptionsTxnComplete = {
    do: typeof enums.txnDo.Complete;
    id: string;
};
/**
 * AceFn
 */
export type AceFnOptionsTxnCancel = {
    do: typeof enums.txnDo.Cancel;
    id: string;
};
/**
 * AceFn
 */
export type AceFnOptionsTxnContinue = {
    id: string;
    do?: undefined;
};
/**
 * AceFn
 */
export type AceFn$Default = {
    enumIds?: {
        [id: string]: number;
    };
    deletedKeys?: (string | number)[];
};
/**
 * AceFn
 */
export type AceFnTxnStartResponse = {
    [prop: string]: any;
} & {
    $ace: AceFn$Default & {
        txnId: string;
        txnStarted: true;
    };
};
/**
 * AceFn
 */
export type AceFnTxnCancelResponse = {
    [prop: string]: any;
} & {
    $ace: AceFn$Default & {
        txnId: string;
        txnCancelled: true;
    };
};
/**
 * AceFn
 */
export type AceFnTxnCompleteResponse = {
    [prop: string]: any;
} & {
    $ace: AceFn$Default & {
        txnId: string;
        txnCompleted: true;
    };
};
/**
 * AceFn
 */
export type AceFnTxnContinueResponse = {
    [prop: string]: any;
} & {
    $ace: AceFn$Default & {
        txnId: string;
    };
};
/**
 * AceFn
 */
export type AceFnNoTxnResponse = {
    [prop: string]: any;
} & {
    $ace?: AceFn$Default;
};
/**
 * AceFn
 */
export type AceFnRequestItem = AceQueryRequestItem | AceMutateRequestItem;
/**
 * AceFn
 */
export type AceFnRequest = AceFnRequestItem | (AceFnRequestItem)[];
/**
 * AceFn
 */
export type AceFnResponse = {
    [prop: string]: any;
    $ace?: AceFn$Default;
};
/**
 * AceFn
 */
export type AceFnFullResponse = {
    now: AceFnResponse;
    original: {
        [k: string]: any;
    };
};
/**
 * AceFn
 */
export type AceFnEmptyGraphResponse = {
    success: true;
};
/**
 * AceFn
 */
export type AceFnStringJWKs = {
    [name: string]: {
        type: "private" | "public" | "crypt";
        jwk: string;
    };
};
/**
 * AceFn
 */
export type AceFnCryptoJWK = {
    [name: string]: CryptoKey;
};
/**
 * AceFn
 */
export type AceFnCryptoJWKs = {
    private: AceFnCryptoJWK;
    public: AceFnCryptoJWK;
    crypt: AceFnCryptoJWK;
};
/**
 * AceFn
 */
export type AceFnIVs = {
    [name: string]: string;
};
/**
 * - If updating we store the orignal items here, based on the id (nodes) or id (relationships)
 */
export type AceFnUpdateRequestItems = {
    nodes: any;
    relationships: any;
};
/**
 * AceFn
 */
export type AceFnDoneReqGatewayParams = {
    res?: AceFnFullResponse;
    error?: any;
    resolve?: (res: AceFnResponse) => void;
    reject?: AcePromiseReject;
};
/**
 * AceFn
 */
export type AceFnDoneReqGatewayResponse = Promise<void>;
/**
 * AceSecure
 */
export type AceSecureParams = {
    options: AceFnOptions;
    token: {
        correct: string;
        req: string;
    };
};
/**
 * AceSchema
 */
export type AceSchemaDetail = {
    lastId: number;
    nowId: number;
};
/**
 * AceSchema
 */
export type AceSchemaDetails = {
    [env: string]: AceSchemaDetail;
};
/**
 * AceSchema
 */
export type AceSchema = {
    lastId: number;
    nodes: {
        [nodeName: string]: AceSchemaNodeValue & {
            $aceId: number;
        };
    };
    relationships?: {
        [relationshipName: string]: AceSchemaRelationshipValue & {
            $aceId: number;
        };
    };
};
/**
 * AceSchema
 */
export type AceSchemaNodeValue = {
    [nodePropName: string]: AceSchemaProp | AceSchemaForwardRelationshipProp | AceSchemaReverseRelationshipProp | AceSchemaBidirectionalRelationshipProp;
};
/**
 * AceSchema
 */
export type AceSchemaRelationshipValue = AceSchemaRelationshipValueOneToOne | AceSchemaRelationshipValueOneToMany | AceSchemaRelationshipValueManyToMany;
/**
 * AceSchema
 */
export type AceSchemaRelationshipValueOneToOne = {
    $aceId: number;
    /**
     * - This is a one to one relationship
     */
    is: typeof enums.schemaIs.OneToOne;
    props?: AceSchemaRelationshipProps | undefined;
};
/**
 * AceSchema
 */
export type AceSchemaRelationshipValueOneToMany = {
    $aceId: number;
    /**
     * - This is a one to many relationship
     */
    is: typeof enums.schemaIs.OneToMany;
    props?: AceSchemaRelationshipProps | undefined;
};
/**
 * AceSchema
 */
export type AceSchemaRelationshipValueManyToMany = {
    $aceId: number;
    /**
     * - This is a many to many relationship
     */
    is: typeof enums.schemaIs.ManyToMany;
    props?: AceSchemaRelationshipProps | undefined;
};
/**
 * AceSchema
 */
export type AceSchemaProp = {
    $aceId: number;
    /**
     * - This is a standard node prop
     */
    is: typeof enums.schemaIs.Prop;
    options: AceSchemaPropOptions;
};
/**
 * AceSchema
 */
export type AceSchemaRelationshipProp = {
    $aceId: number;
    /**
     * - This is a relationship prop
     */
    is: typeof enums.schemaIs.RelationshipProp;
    options: AceSchemaPropOptions;
};
/**
 * AceSchema
 */
export type AceSchemaForwardRelationshipProp = {
    $aceId: number;
    /**
     * - A **Forward** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
     */
    is: typeof enums.schemaIs.ForwardRelationshipProp;
    options: AceSchemaNodeRelationshipOptions;
};
/**
 * AceSchema
 */
export type AceSchemaReverseRelationshipProp = {
    $aceId: number;
    /**
     * - A **Reverse** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
     */
    is: typeof enums.schemaIs.ReverseRelationshipProp;
    options: AceSchemaNodeRelationshipOptions;
};
/**
 * AceSchema
 */
export type AceSchemaBidirectionalRelationshipProp = {
    $aceId: number;
    /**
     * - A **Bidirectional** node relationship prop. Meaning there is only one prop name and it represents both directions. For example if we a relationship name of **isFriendsWith**, the **friends** prop is the **Bidirectional** prop
     */
    is: typeof enums.schemaIs.BidirectionalRelationshipProp;
    options: AceSchemaNodeRelationshipOptions;
};
/**
 * AceSchema
 */
export type AceSchemaPropOptions = {
    /**
     * - The data type for this property
     */
    dataType: enums.dataTypes;
    /**
     * - Must this schema prop be defined
     */
    mustBeDefined?: boolean | undefined;
    /**
     * - Should Ace maintain a sort index for this property. The index will be an array of all this node's id's in the order they are when all these node's are sorted by this property.
     */
    sortIndex?: boolean | undefined;
    /**
     * - Should Ace maintain a unique index for this property. This way you'll know no nodes in your graph have the same value for this property and a AceQueryFind will be faster if searching by this property.
     */
    uniqueIndex?: boolean | undefined;
    /**
     * - Custom description that Ace will add to other types, example: query / mutation types
     */
    description?: string | undefined;
    default?: any;
};
/**
 * AceSchema
 */
export type AceSchemaNodeRelationshipOptions = {
    /**
     * - Does this node have a max of **one** of these props or a max of **many**
     */
    has: enums.schemaHas;
    /**
     * - The node name that this prop points to
     */
    node: string;
    /**
     * - Each node prop that is a relationship must also align with a relationship name. This way the relationship can have its own props.
     */
    relationship: string;
    /**
     * - Must each node in the graph, that aligns with this relationship, have this relationship defined
     */
    mustBeDefined?: boolean | undefined;
    /**
     * - Custom description that Ace will add to other types, example: query / mutation types
     */
    description?: string | undefined;
    /**
     * - When this schema.node is deleted, also delete the node that this prop points to
     */
    cascade?: boolean | undefined;
    default?: undefined;
};
/**
 * - Props for this relationship
 */
export type AceSchemaRelationshipProps = {
    [propName: string]: AceSchemaRelationshipProp;
};
/**
 * - Props for this relationship
 */
export type AceSchemaRelationshipPropsAddition = {
    [propName: string]: AceSchemaRelationshipPropAddition;
};
/**
 * AceSchema
 */
export type AceSchemaDirectionsMapDirection = {
    nodeName: string;
    nodePropName: string;
    id: typeof enums.schemaIs.ForwardRelationshipProp | typeof enums.schemaIs.ReverseRelationshipProp | typeof enums.schemaIs.BidirectionalRelationshipProp;
};
/**
 * AceSchema
 */
export type AceSchemaAddition = {
    lastId?: never;
    nodes: {
        [nodeName: string]: AceSchemaNodeValueAddition & {
            $aceId?: never;
        };
    };
    relationships?: {
        [relationshipName: string]: AceSchemaRelationshipValueAddition & {
            $aceId?: never;
        };
    };
};
/**
 * AceSchema
 */
export type AceSchemaNodeValueAddition = {
    [nodePropName: string]: AceSchemaPropAddition | AceSchemaForwardRelationshipPropAddition | AceSchemaReverseRelationshipPropAddition | AceSchemaBidirectionalRelationshipPropAddition;
};
/**
 * AceSchema
 */
export type AceSchemaRelationshipValueAddition = AceSchemaRelationshipValueOneToOneAddition | AceSchemaRelationshipValueOneToManyAddition | AceSchemaRelationshipValueManyToManyAddition;
/**
 * AceSchema
 */
export type AceSchemaRelationshipValueOneToOneAddition = {
    $aceId?: undefined;
    /**
     * - This is a one to one relationship
     */
    is: typeof enums.schemaIs.OneToOne;
    props?: AceSchemaRelationshipPropsAddition | undefined;
};
/**
 * AceSchema
 */
export type AceSchemaRelationshipValueOneToManyAddition = {
    $aceId?: undefined;
    /**
     * - This is a one to many relationship
     */
    is: typeof enums.schemaIs.OneToMany;
    props?: AceSchemaRelationshipPropsAddition | undefined;
};
/**
 * AceSchema
 */
export type AceSchemaRelationshipValueManyToManyAddition = {
    $aceId?: undefined;
    /**
     * - This is a many to many relationship
     */
    is: typeof enums.schemaIs.ManyToMany;
    props?: AceSchemaRelationshipPropsAddition | undefined;
};
/**
 * AceSchema
 */
export type AceSchemaPropAddition = {
    $aceId?: undefined;
    /**
     * - This is a standard node prop
     */
    is: typeof enums.schemaIs.Prop;
    options: AceSchemaPropOptions;
};
/**
 * AceSchema
 */
export type AceSchemaRelationshipPropAddition = {
    $aceId?: undefined;
    /**
     * - This is a relationship prop
     */
    is: typeof enums.schemaIs.RelationshipProp;
    options: AceSchemaPropOptions;
};
/**
 * AceSchema
 */
export type AceSchemaForwardRelationshipPropAddition = {
    $aceId?: undefined;
    /**
     * - A **Forward** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
     */
    is: typeof enums.schemaIs.ForwardRelationshipProp;
    options: AceSchemaNodeRelationshipOptions;
};
/**
 * AceSchema
 */
export type AceSchemaReverseRelationshipPropAddition = {
    $aceId?: undefined;
    /**
     * - A **Reverse** direction node relationship prop. For example, if the relationship name is **isFollowing**, the **following** prop is the **Forward** prop and the **followers** prop is the **Reverse** prop
     */
    is: typeof enums.schemaIs.ReverseRelationshipProp;
    options: AceSchemaNodeRelationshipOptions;
};
/**
 * AceSchema
 */
export type AceSchemaBidirectionalRelationshipPropAddition = {
    $aceId?: undefined;
    /**
     * - A **Bidirectional** node relationship prop. Meaning there is only one prop name and it represents both directions. For example if we a relationship name of **isFriendsWith**, the **friends** prop is the **Bidirectional** prop
     */
    is: typeof enums.schemaIs.BidirectionalRelationshipProp;
    options: AceSchemaNodeRelationshipOptions;
};
/**
 * AceMutate
 */
export type AceMutateRequestItem = AceMutateRequestItemEmpty | AceMutateRequestItemBackupLoad | AceMutateRequestItemSchema | AceMutateRequestItemNode | AceMutateRequestItemRelationship;
/**
 * AceMutate
 */
export type AceMutateRequestItemSchema = AceMutateRequestItemSchemaAdd | AceMutateRequestItemSchemaRenameNode | AceMutateRequestItemSchemaRenameNodeProp | AceMutateRequestItemSchemaRenameRelationship | AceMutateRequestItemSchemaRenameRelationshipProp | AceMutateRequestItemSchemaDeleteNodes | AceMutateRequestItemSchemaDeleteNodeProps | AceMutateRequestItemSchemaUpdateNodePropHas | AceMutateRequestItemSchemaUpdateNodePropCascade | AceMutateRequestItemSchemaUpdatePropDefault | AceMutateRequestItemSchemaUpdatePropMustBeDefined | AceMutateRequestItemSchemaUpdatePropSortIndex | AceMutateRequestItemSchemaUpdatePropUniqueIndex | AceMutateRequestItemSchemaPush;
/**
 * AceMutate
 */
export type AceMutateRequestItemNode = AceMutateRequestItemNodeInsert | AceMutateRequestItemNodeUpdate | AceMutateRequestItemNodeUpsert | AceMutateRequestItemNodeDelete | AceMutateRequestItemNodePropDelete | AceMutateRequestItemSchemaDeleteNodes | AceMutateRequestItemSchemaDeleteNodeProps;
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationship = AceMutateRequestItemRelationshipInsert | AceMutateRequestItemRelationshipUpdate | AceMutateRequestItemRelationshipUpsert | AceMutateRequestItemRelationshipDelete | AceMutateRequestItemRelationshipPropDelete;
/**
 * AceMutate
 */
export type AceMutateRequestItemBackupLoad = {
    do: typeof enums.aceDo.BackupLoad;
    how: AceMutateRequestItemBackupLoadHow;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemBackupLoadHow = {
    backup: string;
    skipDataDelete?: boolean | undefined;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemEmpty = AceMutateRequestItemEmptyGraph | AceMutateRequestItemEmptyTrash;
/**
 * AceMutate
 */
export type AceMutateRequestItemEmptyGraph = {
    /**
     * - Delete schema and all datamfrom graph
     */
    do: typeof enums.aceDo.EmptyGraph;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemEmptyTrash = {
    /**
     * - Delete all folders in trash
     */
    do: typeof enums.aceDo.EmptyTrash;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeInsert = {
    do: typeof enums.aceDo.NodeInsert;
    how: AceMutateRequestItemNodeInsertHow;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeInsertHow = {
    node: string;
    props: AceMutateRequestItemNodeInsertProps;
    $o?: AceMutateRequestOptions | undefined;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipInsert = {
    do: typeof enums.aceDo.RelationshipInsert;
    how: AceMutateRequestItemRelationshipInsertHow;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipInsertHow = {
    relationship: string;
    props: AceMutateRequestItemRelationshipInsertProps;
    $o?: AceMutateRequestOptions | undefined;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeUpdate = {
    do: typeof enums.aceDo.NodeUpdate;
    how: AceMutateRequestItemNodeUpdateHow;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeUpdateHow = {
    node: string;
    props: AceMutateRequestItemNodeUpdateProps;
    $o?: AceMutateRequestOptions | undefined;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipUpdate = {
    do: typeof enums.aceDo.RelationshipUpdate;
    how: AceMutateRequestItemRelationshipUpdateHow;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipUpdateHow = {
    relationship: string;
    props: AceMutateRequestItemRelationshipUpdateProps;
    $o?: AceMutateRequestOptions | undefined;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeUpsert = {
    do: typeof enums.aceDo.NodeUpsert;
    how: AceMutateRequestItemNodeUpsertHow;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeUpsertHow = {
    node: string;
    props: AceMutateRequestItemNodeUpsertProps;
    $o?: AceMutateRequestOptions | undefined;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipUpsert = {
    do: typeof enums.aceDo.RelationshipUpsert;
    how: AceMutateRequestItemRelationshipUpsertHow;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipUpsertHow = {
    relationship: string;
    props: AceMutateRequestItemRelationshipUpsertProps;
    $o?: AceMutateRequestOptions | undefined;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipInup = AceMutateRequestItemRelationshipInsert | AceMutateRequestItemRelationshipUpdate | AceMutateRequestItemRelationshipUpsert;
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeWithRelationships = AceMutateRequestItemNodeUpdate & {
    [relationshipProp: string]: string[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeDelete = {
    do: typeof enums.aceDo.NodeDelete;
    /**
     * - The ids you'd love deleted. To cascade delete, add cascade to the schema
     */
    how: (string | number)[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipDelete = {
    do: typeof enums.aceDo.RelationshipDelete;
    how: {
        _ids: (string | number)[];
    };
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodePropDelete = {
    do: typeof enums.aceDo.NodePropDelete;
    how: {
        ids: (string | number)[];
        props: string[];
    };
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipPropDelete = {
    do: typeof enums.aceDo.RelationshipPropDelete;
    how: {
        _ids: (string | number)[];
        props: string[];
    };
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaDeleteNodes = {
    do: typeof enums.aceDo.SchemaDeleteNodes;
    how: AceMutateRequestItemSchemaDeleteNodesItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaDeleteNodesItem = string;
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaDeleteRelationships = {
    do: typeof enums.aceDo.SchemaDeleteRelationships;
    how: AceMutateRequestItemSchemaDeleteRelationshipsItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaDeleteRelationshipsItem = string;
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaDeleteRelationshipProps = {
    do: typeof enums.aceDo.SchemaDeleteRelationshipProps;
    how: AceMutateRequestItemSchemaDeleteRelationshipPropsItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaDeleteRelationshipPropsItem = {
    relationship: string;
    prop: string;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaDeleteNodeProps = {
    do: typeof enums.aceDo.SchemaDeleteNodeProps;
    how: AceMutateRequestItemSchemaDeleteNodePropsItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaDeleteNodePropsItem = {
    node: string;
    prop: string;
};
/**
 * - To remove "default" from a prop in the schema, in the props array, "default" must be undefined
 */
export type AceMutateRequestItemSchemaUpdatePropDefault = {
    /**
     * - To remove "default" from a prop in the schema, in the props array, "default" must be undefined
     */
    do: typeof enums.aceDo.SchemaUpdatePropDefault;
    /**
     * - To remove "default" from a prop in the schema, in the props array, "default" must be undefined
     */
    how: AceMutateRequestItemSchemaUpdatePropDefaultItem[];
};
/**
 * - To remove "default" from a prop in the schema, in the props array, "default" must be undefined
 */
export type AceMutateRequestItemSchemaUpdatePropDefaultItem = {
    nodeOrRelationship: string;
    prop: string;
    default?: any;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdatePropMustBeDefined = {
    do: typeof enums.aceDo.SchemaUpdatePropMustBeDefined;
    how: AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdatePropMustBeDefinedItem = {
    nodeOrRelationship: string;
    prop: string;
    mustBeDefined: boolean;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdatePropSortIndex = {
    do: typeof enums.aceDo.SchemaUpdatePropSortIndex;
    how: AceMutateRequestItemSchemaUpdatePropSortIndexItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdatePropSortIndexItem = {
    nodeOrRelationship: string;
    prop: string;
    sortIndex: boolean;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdatePropUniqueIndex = {
    do: typeof enums.aceDo.SchemaUpdatePropUniqueIndex;
    how: AceMutateRequestItemSchemaUpdatePropUniqueIndexItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdatePropUniqueIndexItem = {
    nodeOrRelationship: string;
    prop: string;
    uniqueIndex: boolean;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaRenameNode = {
    do: typeof enums.aceDo.SchemaRenameNode;
    how: AceMutateRequestItemSchemaRenameNodeItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaRenameNodeItem = {
    nowName: string;
    newName: string;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaRenameNodeProp = {
    do: typeof enums.aceDo.SchemaRenameNodeProp;
    how: AceMutateRequestItemSchemaRenameNodePropItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaRenameNodePropItem = {
    node: string;
    nowName: string;
    newName: string;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdateNodePropHas = {
    do: typeof enums.aceDo.SchemaUpdateNodePropHas;
    how: AceMutateRequestItemSchemaUpdateNodePropHasItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdateNodePropHasItem = {
    node: string;
    prop: string;
    has: enums.schemaHas;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdateNodePropCascade = {
    do: typeof enums.aceDo.SchemaUpdateNodePropCascade;
    how: AceMutateRequestItemSchemaUpdateNodePropCascadeItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaUpdateNodePropCascadeItem = {
    node: string;
    prop: string;
    cascade: boolean;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaRenameRelationship = {
    do: typeof enums.aceDo.SchemaRenameRelationship;
    how: AceMutateRequestItemSchemaRenameRelationshipItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaRenameRelationshipItem = {
    nowName: string;
    newName: string;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaRenameRelationshipProp = {
    do: typeof enums.aceDo.SchemaRenameRelationshipProp;
    how: AceMutateRequestItemSchemaRenameRelationshipPropItem[];
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaRenameRelationshipPropItem = {
    relationship: string;
    nowName: string;
    newName: string;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaAdd = {
    do: typeof enums.aceDo.SchemaAdd;
    how: AceSchemaAddition;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemSchemaPush = {
    do: typeof enums.aceDo.SchemaPush;
    /**
     * - Aim version number
     */
    how: number;
};
/**
 * AceMutate
 */
export type AceMutateRequestOptions = {
    cryptJWK?: string | undefined;
    privateJWK?: string | undefined;
    iv?: string | undefined;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeInsertProps = {
    id?: string | number;
    [propName: string]: any;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeUpdateProps = {
    id: string | number;
    [propName: string]: any;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemNodeUpsertProps = {
    id: string | number;
    [propName: string]: any;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipInsertProps = {
    a: string | number;
    b: string | number;
    [propName: string]: any;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipUpdateProps = {
    id: string | number;
    a: string | number;
    b: string | number;
    [propName: string]: any;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipUpsertProps = {
    id: string | number;
    a: string | number;
    b: string | number;
    [propName: string]: any;
};
/**
 * AceMutate
 */
export type AceMutateRequestItemRelationshipInUpProps = AceMutateRequestItemRelationshipInsertProps | AceMutateRequestItemRelationshipUpdateProps | AceMutateRequestItemRelationshipUpsertProps;
/**
 * AceQuery
 */
export type AceQueryRequestItemNode = {
    do: typeof enums.aceDo.NodeQuery;
    how: AceQueryRequestItemNodeHow;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemNodeHow = {
    node: string;
    resKey: string;
    resValue: AceQueryCount | AceQueryStars | AceQueryRequestItemNodeResValue;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemRelationship = {
    do: typeof enums.aceDo.RelationshipQuery;
    how: AceQueryRequestItemRelationshipHow;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemRelationshipHow = {
    relationship: string;
    resKey: string;
    resValue: AceQueryCount | AceQueryStars | AceQueryRequestItemRelationshipResValue;
};
/**
 * AceQuery
 */
export type AceQueryRequestItem = AceQueryRequestItemNode | AceQueryRequestItemRelationship | AceQueryRequestItemBackupGet | AceQueryRequestItemSchemaGet;
/**
 * AceQuery
 */
export type AceQueryResValuePropValue = boolean | {
    alias: string;
    iv?: never;
    jwk?: never;
} | {
    iv: string;
    jwk: string;
    alias?: never;
};
/**
 * AceQuery
 */
export type AceQueryStars = "*" | "**" | "***";
/**
 * AceQuery
 */
export type AceQueryCount = "count";
/**
 * AceQuery
 */
export type AceQueryResHide = Set<string> | null;
/**
 * AceQuery
 */
export type AceQueryRequestItemDetailedResValueSection = {
    resValueKey: string;
    resKey: string;
    aliasResKey?: string | undefined;
    schemaHas: enums.schemaHas;
    do: "NodeQuery" | "RelationshipQuery";
    parent?: AceQueryRequestItemDetailedResValueSection | undefined;
    node?: string | undefined;
    relationship?: string | undefined;
    resValue: AceQueryRequestItemNodeResValue;
    resHide: Set<string> | null;
};
/**
 * AceQuery
 */
export type AceQueyWhereGetValueResponse = {
    value: any;
    is: "value" | "prop";
    detailedResValueSection: null | AceQueryRequestItemDetailedResValueSection;
};
/**
 * AceQuery
 */
export type AceQueryAddPropsItem = {
    node?: any;
    relationship?: any;
    id?: string;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemNodeResValue = {
    [propertyName: string]: any;
    id?: AceQueryResValuePropValue;
    $o?: AceQueryRequestItemNodeOptions;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemRelationshipResValue = {
    [propertyName: string]: any;
    _id?: AceQueryResValuePropValue;
    $o?: AceQueryRequestItemNodeOptions;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemNodeOptions = {
    flow?: enums.queryOptions[] | undefined;
    alias?: string | undefined;
    fill?: AceQueryStars | undefined;
    sort?: AceQuerySort | undefined;
    findById?: string | number | undefined;
    findBy_Id?: string | number | undefined;
    findByUnique?: AceQueryFindByUnique | undefined;
    filterByIds?: (string | number)[] | undefined;
    filterBy_Ids?: (string | number)[] | undefined;
    filterByUniques?: AceQueryFilterByUniques | undefined;
    publicJWKs?: AceQueryRequestItemPublicJWKOption | undefined;
    /**
     * - Find the count for the number of items in the response and then add this value as this **prop** to each node in the response
     */
    countAsProp?: string | undefined;
    sumAsProp?: AceQuerySumAsProp | undefined;
    avgAsProp?: AceQueryAverageAsProp | undefined;
    minAmtAsProp?: AceQueryMinAmountAsProp | undefined;
    maxAmtAsProp?: AceQueryMaxAmountAsProp | undefined;
    newProps?: AceQueryNewPropsProp | undefined;
    propAdjToRes?: AceQueryPropAdjacentToResponse | undefined;
    findByOr?: AceQueryFindGroup | undefined;
    findByAnd?: AceQueryFindGroup | undefined;
    findByPropValue?: AceQueryWherePropValue | undefined;
    findByPropProp?: AceQueryWherePropProp | undefined;
    findByPropRes?: AceQueryWherePropRes | undefined;
    findByDefined?: string | undefined;
    findByUndefined?: string | undefined;
    filterByOr?: AceQueryFilterGroup | undefined;
    filterByAnd?: AceQueryFilterGroup | undefined;
    filterByDefined?: string | undefined;
    filterByUndefined?: string | undefined;
    filterByPropValue?: AceQueryWherePropValue | undefined;
    filterByPropProp?: AceQueryWherePropProp | undefined;
    filterByPropRes?: AceQueryWherePropRes | undefined;
    limit?: AceQueryLimit | undefined;
    /**
     * - Prop name that will be adjacent to this array in the response and hold the length of this array in the response
     */
    countAdjToRes?: string | undefined;
    /**
     * - Array of props you'd love to hide in the response
     */
    resHide?: string[] | undefined;
    propAsRes?: AceQueryPropAsResponse | undefined;
    /**
     * - Display the count of results as the response
     */
    countAsRes?: boolean | undefined;
    /**
     * - Loop the items in the response, calculate the sum of this property, amongst all response items and set it as the response
     */
    sumAsRes?: string | undefined;
    /**
     * - Loop the items in the response, calculate the average of this property, amongst all response items and set it as the response
     */
    avgAsRes?: string | undefined;
    /**
     * - Loop the items in the response, find the min amount of this property, amongst all response items and set it as the response
     */
    minAmtAsRes?: string | undefined;
    /**
     * - Loop the items in the response, find the max amount of this property, amongst all response items and set it as the response
     */
    maxAmtAsRes?: string | undefined;
    /**
     * - Find the smallest numerical value of each node's **property** in the response and then set the node that has that value as the response
     */
    minNodeAsRes?: string | undefined;
    /**
     * - Find the largest numerical value of each node's **property** in the response and then set the node that has that value as the response
     */
    maxNodeAsRes?: string | undefined;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemRelationshipOptions = {
    flow?: enums.queryOptions[] | undefined;
    alias?: string | undefined;
    fill?: AceQueryStars | undefined;
    all?: boolean | undefined;
    sort?: AceQuerySort | undefined;
    findBy_Id?: string | undefined;
    filterBy_Ids?: string[] | undefined;
    publicJWKs?: AceQueryRequestItemPublicJWKOption | undefined;
    /**
     * - Find the count for the number of items in the response and then add this value as this **prop** to each node in the response
     */
    countAsProp?: string | undefined;
    sumAsProp?: AceQuerySumAsProp | undefined;
    avgAsProp?: AceQueryAverageAsProp | undefined;
    minAmtAsProp?: AceQueryMinAmountAsProp | undefined;
    maxAmtAsProp?: AceQueryMaxAmountAsProp | undefined;
    newProps?: AceQueryNewPropsProp | undefined;
    propAdjToRes?: AceQueryPropAdjacentToResponse | undefined;
    findByOr?: AceQueryFindGroup | undefined;
    findByAnd?: AceQueryFindGroup | undefined;
    findByDefined?: string | undefined;
    findByUndefined?: string | undefined;
    findByPropValue?: AceQueryWherePropValue | undefined;
    findByPropProp?: AceQueryWherePropProp | undefined;
    findByPropRes?: AceQueryWherePropRes | undefined;
    filterByOr?: AceQueryFilterGroup | undefined;
    filterByAnd?: AceQueryFilterGroup | undefined;
    filterByDefined?: string | undefined;
    filterByUndefined?: string | undefined;
    filterByPropValue?: AceQueryWherePropValue | undefined;
    filterByPropProp?: AceQueryWherePropProp | undefined;
    filterByPropRes?: AceQueryWherePropRes | undefined;
    limit?: AceQueryLimit | undefined;
    /**
     * - Prop name that will be adjacent to this array in the response and hold the length of this array in the response
     */
    countAdjToRes?: string | undefined;
    /**
     * - Array of props you'd love to hide in the response
     */
    resHide?: string[] | undefined;
    propAsRes?: AceQueryPropAsResponse | undefined;
    /**
     * - Display the count of results as the response
     */
    countAsRes?: boolean | undefined;
    /**
     * - Loop the items in the response, calculate the sum of this property, amongst all response items and set it as the response
     */
    sumAsRes?: string | undefined;
    /**
     * - Loop the items in the response, calculate the average of this property, amongst all response items and set it as the response
     */
    avgAsRes?: string | undefined;
    /**
     * - Loop the items in the response, find the min amount of this property, amongst all response items and set it as the response
     */
    minAmtAsRes?: string | undefined;
    /**
     * - Loop the items in the response, find the max amount of this property, amongst all response items and set it as the response
     */
    maxAmtAsRes?: string | undefined;
    /**
     * - Find the smallest numerical value of each node's **property** in the response and then set the node that has that value as the response
     */
    minNodeAsRes?: string | undefined;
    /**
     * - Find the largest numerical value of each node's **property** in the response and then set the node that has that value as the response
     */
    maxNodeAsRes?: string | undefined;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemPublicJWKOption = {
    findByOr?: string | undefined;
    findByAnd?: string | undefined;
    findByPropValue?: string | undefined;
    findByPropRes?: string | undefined;
    filterByOr?: string | undefined;
    filterByAnd?: string | undefined;
    filterByPropValue?: string | undefined;
    filterByPropRes?: string | undefined;
};
/**
 * AceQuery
 */
export type AceQueryWhereItemProp = {
    prop: string;
    relationships?: string[] | undefined;
    iv?: string | undefined;
    jwk?: string | undefined;
};
/**
 * AceQuery
 */
export type AceQueryWhereItemValue = any;
/**
 * - An array from response, so if you'd love to point to response.abc.xyz[10].yay this value would be [ 'abc', 'xyz', 10, 'yay' ]
 */
export type AceQueryWhereItemRes = {
    /**
     * - An array from response, so if you'd love to point to response.abc.xyz[10].yay this value would be [ 'abc', 'xyz', 10, 'yay' ]
     */
    res: any[];
};
/**
 * AceQuery
 */
export type AceQueryWhereOr = {
    or: AceQueryFindGroup;
};
/**
 * AceQuery
 */
export type AceQueryWhereAnd = {
    and: AceQueryFindGroup;
};
/**
 * AceQuery
 */
export type AceQueryWhereDefined = {
    isPropDefined: string;
};
/**
 * AceQuery
 */
export type AceQueryWhereUndefined = {
    isPropUndefined: string;
};
/**
 * AceQuery
 */
export type AceQueryWherePropProp = [AceQueryWhereItemProp, enums.queryWhereSymbol, AceQueryWhereItemProp];
/**
 * AceQuery
 */
export type AceQueryWherePropValue = [AceQueryWhereItemProp, enums.queryWhereSymbol, AceQueryWhereItemValue];
/**
 * AceQuery
 */
export type AceQueryWherePropRes = [AceQueryWhereItemProp, enums.queryWhereSymbol, AceQueryWhereItemRes];
/**
 * AceQuery
 */
export type AceQueryFindGroup = (AceQueryWherePropValue | AceQueryWherePropProp | AceQueryWherePropRes | AceQueryWhereDefined | AceQueryWhereUndefined | AceQueryWhereOr | AceQueryWhereAnd)[];
/**
 * AceQuery
 */
export type AceQueryFilterGroup = (AceQueryWherePropValue | AceQueryWherePropProp | AceQueryWherePropRes | AceQueryWhereDefined | AceQueryWhereUndefined | AceQueryWhereOr | AceQueryWhereAnd)[];
/**
 * AceQuery
 */
export type AceQueryFilterByUniques = {
    /**
     * - With this array of unique values, returns an array of valid nodes (valid meaning: found in graph via unique index & $o qualifiying)
     */
    uniques: AceQueryFilterByUniquesItem[];
};
/**
 * AceQuery
 */
export type AceQueryFilterByUniquesItem = {
    /**
     * - The value Ace will query to find a unique match for
     */
    value: string;
    /**
     * - Filter nodes/relationships by this prop that has a unique index
     */
    prop: string;
};
/**
 * AceQuery
 */
export type AceQueryFindByUnique = {
    /**
     * - The value Ace will query to find a unique match for
     */
    value: string;
    /**
     * - Find node/relationship by this prop that has a unique index
     */
    prop: string;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemSchemaGet = {
    do: typeof enums.aceDo.SchemaGet;
    /**
     * - Response key
     */
    how: string;
};
/**
 * AceQuery
 */
export type AceQueryRequestItemBackupGet = {
    do: typeof enums.aceDo.BackupGet;
    /**
     * - Response key
     */
    how: string;
};
/**
 * AceQuery
 */
export type AceQueryValue = {
    value: any;
};
/**
 * AceQuery
 */
export type AceQuerySort = {
    how: enums.sortHow;
    prop: string;
};
/**
 * AceQuery
 */
export type AceQueryLimit = {
    skip?: number | undefined;
    count?: number | undefined;
};
/**
 * AceQuery
 */
export type AceQueryProp = {
    /**
     * - String property name
     */
    prop: string;
    /**
     * - If this property is not on the node, list the relationship properties to get to the desired nodes
     */
    relationships?: string[] | undefined;
};
/**
 * AceQuery
 */
export type AceQuerySumAsProp = {
    /**
     * - Add the sum of the **computeProp** of each node in the response
     */
    computeProp: string;
    /**
     * - Add the sum of the **computeProp** of each node in the response and add this value as the **newProp** to each node in the response
     */
    newProp: string;
};
/**
 * AceQuery
 */
export type AceQueryPropAsResponse = {
    /**
     * - String that is the prop name that you would love to show as the response
     */
    prop: string;
    /**
     * - Array of strings (node relationship prop names) that takes us, from the node we are starting on, to the desired node, with the property you'd love to source. The relationship must be defined in the query to find any properties of the relationship. So if I am starting @ User and I'd love to get to User.role.enum, the relationships will be **[ 'role' ]**, property is **'enum'** and in the query I've got **{ x: { role: { id: true } } }**
     */
    relationships?: string[] | undefined;
};
/**
 * AceQuery
 */
export type AceQueryPropAdjacentToResponse = {
    sourceProp: string;
    adjacentProp: string;
    /**
     * - Array of strings (node relationship prop names) that takes us, from the node we are starting on, to the desired node, with the property you'd love to see, as the response. The relationship must be defined in the query to find any properties of the relationship. So if I am starting @ User and I'd love to get to User.role.enum, the relationships will be **[ 'role' ]**, property is **'enum'** and in the query I've got **{ x: { role: { id: true } } }**
     */
    relationships?: string[] | undefined;
};
/**
 * AceQuery
 */
export type AceQueryAverageAsProp = {
    /**
     * - Add the sum of the **computeProp** of each node in the response and then divide by the count of items in the response
     */
    computeProp: string;
    /**
     * - Add the sum of the **computeProp** of each node in the response and then divide by the count of items in the response and add this value as the **newProp** to each node in the response
     */
    newProp: string;
};
/**
 * AceQuery
 */
export type AceQueryMinAmountAsProp = {
    /**
     * - Find the smallest numerical value of each node's **computeProp** in the response
     */
    computeProp: string;
    /**
     * - Find the smallest numerical value of each node's **computeProp** in the response and then add this value as the **newProp** to each node in the response
     */
    newProp: string;
};
/**
 * AceQuery
 */
export type AceQueryMaxAmountAsProp = {
    /**
     * - Find the largest numerical value of each node's **computeProp** in the response
     */
    computeProp: string;
    /**
     * - Find the largest numerical value of each node's **computeProp** in the response and then add this value as the **newProp** to each node in the response
     */
    newProp: string;
};
/**
 * AceQuery
 */
export type AceQueryNewPropsProp = {
    [propName: string]: AceQueryNewPropsGroup;
};
/**
 * AceQuery
 */
export type AceQueryNewPropsGroup = {
    add: AceQueryNewPropsGroupItem[];
    subtract?: never;
    multiply?: never;
    divide?: never;
} | {
    subtract: AceQueryNewPropsGroupItem[];
    add?: never;
    multiply?: never;
    divide?: never;
} | {
    multiply: AceQueryNewPropsGroupItem[];
    add?: never;
    subtract?: never;
    divide?: never;
} | {
    divide: AceQueryNewPropsGroupItem[];
    add?: never;
    subtract?: never;
    multiply?: never;
};
/**
 * AceQuery
 */
export type AceQueryNewPropsGroupItem = number | string | AceQueryProp | AceQueryNewPropsGroup;
/**
 * AceBackup
 */
export type AceBackupResponse = {
    [k: string]: any;
};
/**
 * AcePromise
 */
export type AcePromiseReject = (reason?: any) => void;
/**
 * AceStorage
 */
export type AceStorageSearchGraphEntries = {
    key: string | number;
    index: number;
    value?: AceGraphItem;
}[];
/**
 * AceCLI
 */
export type AceCLIPromptSwitchCallbacks = {
    /**
     * - Called when the input is a newline or end-of-transmission character.
     */
    onEnter: (arg0: any) => Promise<void>;
    /**
     * - Called when the input is the interrupt character (Ctrl+C).
     */
    onControlC: (arg0: any) => void;
    /**
     * - Called when the input is a backspace character.
     */
    onBackspace: (arg0: any) => void;
    /**
     * - Called for any other input.
     */
    onCharacter: (arg0: any) => void;
};
import * as enums from './enums.js';
