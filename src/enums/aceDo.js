export const aceDo = new Map([ // boolean => will this id write to the graph (helpful for Memory.txn.hasUpdates)
  [ 'Empty', true ],

  // Backup
  [ 'BackupGet', false ],
  [ 'BackupLoad', true ],

  // Plugin
  [ 'PluginInstall', false ],
  [ 'PluginUninstall', false ],

  // Schema
  [ 'SchemaGet', false ],
  [ 'SchemaAdd', true ],
  [ 'SchemaUpdateNodeName', true ],
  [ 'SchemaUpdateNodePropName', true ],
  [ 'SchemaUpdateRelationshipName', true ],
  [ 'SchemaUpdateRelationshipPropName', true ],

  // Schema Delete
  [ 'SchemaDeleteNodes', true ],
  [ 'SchemaDeleteNodeProps', true ],
  [ 'SchemaDeleteRelationships', true ],
  [ 'SchemaDeleteRelationshipProps', true ],

  // Schema Update Prop
  [ 'SchemaUpdatePropMustBeDefined', true ],
  [ 'SchemaUpdateNodePropCascade', true ],
  [ 'SchemaUpdateNodePropHas', true ],

  // Node
  [ 'NodeInsert', true ],
  [ 'NodeUpdate', true ],
  [ 'NodeUpsert', true ],
  [ 'NodeQuery', false ],
  [ 'NodeDelete', true ],
  [ 'NodePropDelete', true ],

  // Relationship
  [ 'RelationshipInsert', true ],
  [ 'RelationshipUpdate', true ],
  [ 'RelationshipUpsert', true ],
  [ 'RelationshipQuery', false ],
  [ 'RelationshipDelete', true ],
  [ 'RelationshipPropDelete', true ],
])


export const aceDoUpdateSet = new Set()


for (const entry of aceDo) {
  if (entry[1]) {
    aceDoUpdateSet.add(entry[0])
  }
}
