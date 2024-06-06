import esbuild from 'esbuild'


esbuild.build({ // // https://esbuild.github.io/api/
  logLevel: 'info', // Show warnings, errors, and an output file summary. 
  sourcemap: true, // Source maps can make it easier to debug your code. They encode the information necessary to translate from a line/column offset in a generated output file back to a line/column offset in the corresponding original input file. 
  minify: true, // When enabled, the generated code will be minified instead of pretty-printed. 
  outdir: './dist', // Sets the output directory for the build operation.
  entryPoints: [ // This is an array of files that each serve as an input to the bundling algorithm.
    './tsc/src/ace/gateway/approachReqGateway.js',
    './tsc/src/ace/gateway/doneReqGateway.js',
    './tsc/src/ace/gateway/enterReqGateway.js',

    './tsc/src/ace/id/enumIdToGraphId.js',
    './tsc/src/ace/id/getGraphId.js',

    './tsc/src/ace/mutate/applyDefaults.js',
    './tsc/src/ace/mutate/delete_IdsFromRelationshipIndex.js',
    './tsc/src/ace/mutate/delete_IdFromRelationshipProp.js',
    './tsc/src/ace/mutate/deleteNodePropsById.js',
    './tsc/src/ace/mutate/deleteNodesById.js',
    './tsc/src/ace/mutate/deleteRelationshipPropsById.js',
    './tsc/src/ace/mutate/deleteRelationshipsBy_Ids.js',
    './tsc/src/ace/mutate/inupNode.js',
    './tsc/src/ace/mutate/inupRelationship.js',
    './tsc/src/ace/mutate/overwriteIds.js',
    './tsc/src/ace/mutate/validateMustBeDefined.js',

    './tsc/src/ace/query/doQueryOptions.js',
    './tsc/src/ace/query/getDetailedResValue.js',
    './tsc/src/ace/query/getNewProps.js',
    './tsc/src/ace/query/getRelationshipNode.js',
    './tsc/src/ace/query/query.js',
    './tsc/src/ace/query/queryWhere.js',

    './tsc/src/ace/txn/cancelTxn.js',
    './tsc/src/ace/txn/setTxnEnv.js',
    './tsc/src/ace/txn/setTxnId.js',
    './tsc/src/ace/txn/setTxnStep.js',
    './tsc/src/ace/txn/setTxnTimer.js',

    './tsc/src/ace/ace.js',
    './tsc/src/ace/addSortIndicesToGraph.js',
    './tsc/src/ace/deligate.js',
    './tsc/src/ace/log.js',
    './tsc/src/ace/set$ace.js',
    './tsc/src/ace/setHasUpdates.js',
    './tsc/src/ace/setJWKs.js',

    './tsc/src/cli/cli.js',
    './tsc/src/cli/cliTypes.js',
    './tsc/src/cli/getEnums.js',
    './tsc/src/cli/getHelp.js',
    './tsc/src/cli/getIndex.js',
    './tsc/src/cli/getTsConfig.js',
    './tsc/src/cli/getTypedefs.js',
    './tsc/src/cli/getVersion.js',
    './tsc/src/cli/logJWKs.js',
    './tsc/src/cli/trash.js',

    './tsc/src/empty/emptyFile.js',
    './tsc/src/empty/emptyMemory.js',
    './tsc/src/empty/revertEmptyFile.js',

    './tsc/src/enums/aceDo.js',
    './tsc/src/enums/dataTypes.js',
    './tsc/src/enums/jwkTypes.js',
    './tsc/src/enums/queryNewPropsSymbol.js',
    './tsc/src/enums/queryOptions.js',
    './tsc/src/enums/queryWhereGroupSymbol.js',
    './tsc/src/enums/queryWhereSymbol.js',
    './tsc/src/enums/schemaHas.js',
    './tsc/src/enums/schemaIs.js',
    './tsc/src/enums/sortHow.js',
    './tsc/src/enums/txnDo.js',
    './tsc/src/enums/txnSteps.js',
    './tsc/src/enums/writeDo.js',

    './tsc/src/objects/AceError.js',
    './tsc/src/objects/Memory.js',
    './tsc/src/objects/SchemaDataStructures.js',
    './tsc/src/objects/SchemaDetails.js',
    './tsc/src/objects/Txn.js',

    './tsc/src/schema/addToSchema.js',
    './tsc/src/schema/doneSchemaUpdate.js',
    './tsc/src/schema/revertWriteSchema.js',
    './tsc/src/schema/schemaDeleteNodeProps.js',
    './tsc/src/schema/schemaDeleteNodes.js',
    './tsc/src/schema/schemaUpdateNodeName.js',
    './tsc/src/schema/schemaUpdateNodePropCascade.js',
    './tsc/src/schema/schemaUpdateNodePropHas.js',
    './tsc/src/schema/schemaUpdateNodePropName.js',
    './tsc/src/schema/schemaUpdateRelationshipName.js',
    './tsc/src/schema/schemaUpdateRelationshipPropName.js',
    './tsc/src/schema/setSchema.js',
    './tsc/src/schema/validateSchema.js',
    './tsc/src/schema/writeSchema.js',

    './tsc/src/security/createJWKs.js',
    './tsc/src/security/crypt.js',
    './tsc/src/security/getRandomBase64.js',
    './tsc/src/security/hash.js',
    './tsc/src/security/transmute.js',

    './tsc/src/util/file.js',
    './tsc/src/util/isObjectPopulated.js',
    './tsc/src/util/storage.js',
    './tsc/src/util/variables.js',

    './tsc/src/wal/appendWal.js',
    './tsc/src/wal/walMapInitialize.js',
    './tsc/src/wal/revertAppendWal.js',

    './tsc/src/index.js',
  ],
})
