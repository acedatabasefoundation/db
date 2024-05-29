import esbuild from 'esbuild'


esbuild.build({ // // https://esbuild.github.io/api/
  logLevel: 'info', // Show warnings, errors, and an output file summary. 
  sourcemap: true, // Source maps can make it easier to debug your code. They encode the information necessary to translate from a line/column offset in a generated output file back to a line/column offset in the corresponding original input file. 
  minify: true, // When enabled, the generated code will be minified instead of pretty-printed. 
  outdir: './dist', // Sets the output directory for the build operation.
  entryPoints: [ // This is an array of files that each serve as an input to the bundling algorithm.
    './tsc/src/ace/mutate/mutate.js',
    './tsc/src/ace/mutate/mutateNode.js',
    './tsc/src/ace/mutate/mutateRelationship.js',
    './tsc/src/ace/mutate/mutateSchema.js',

    './tsc/src/ace/query/doQueryOptions.js',
    './tsc/src/ace/query/getNewProps.js',
    './tsc/src/ace/query/getDetailedResValue.js',
    './tsc/src/ace/query/getRelationshipNode.js',
    './tsc/src/ace/query/query.js',
    './tsc/src/ace/query/queryWhere.js',

    './tsc/src/ace/ace.js',
    './tsc/src/ace/enumIdToGraphId.js',
    './tsc/src/ace/file.js',
    './tsc/src/ace/getGraphId.js',
    './tsc/src/ace/storage.js',
    './tsc/src/ace/validateMustBeDefined.js',
    './tsc/src/ace/validateSchema.js',
    './tsc/src/ace/wal.js',

    './tsc/src/cli/cli.js',
    './tsc/src/cli/cliTypes.js',
    './tsc/src/cli/getEnums.js',
    './tsc/src/cli/getHelp.js',
    './tsc/src/cli/getIndex.js',
    './tsc/src/cli/getTsConfig.js',
    './tsc/src/cli/getTypedefs.js',
    './tsc/src/cli/getVersion.js',
    './tsc/src/cli/logJWKs.js',

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
    './tsc/src/enums/txnActions.js',
    './tsc/src/enums/txnSteps.js',
    './tsc/src/enums/writeActions.js',

    './tsc/src/memory/memory.js',
    './tsc/src/memory/memoryInitialize.js',

    './tsc/src/objects/AceError.js',
    './tsc/src/objects/SchemaDataStructures.js',
    './tsc/src/objects/Txn.js',

    './tsc/src/schema/fromFile.js',
    './tsc/src/schema/toFile.js',

    './tsc/src/security/createJWKs.js',
    './tsc/src/security/crypt.js',
    './tsc/src/security/getRandomBase64.js',
    './tsc/src/security/hash.js',
    './tsc/src/security/transmute.js',

    './tsc/src/util/isObjectPopulated.js',
    './tsc/src/util/variables.js',

    './tsc/src/index.js',
  ],
})
