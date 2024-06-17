export const aceDo = new Map([ // boolean => will this id write to the graph (helpful for Memory.txn.hasUpdates)
  // Empty
  [ 'EmptyGraph', true ],
  [ 'EmptyTrash', true ],

  // Backup
  [ 'BackupGet', false ],
  [ 'BackupLoad', true ],

  // Plugin
  [ 'PluginInstall', false ],
  [ 'PluginUninstall', false ],

  // Schema
  [ 'SchemaAdd', true ],
  [ 'SchemaGet', false ],
  [ 'SchemaPush', true ],
  [ 'SchemaRenameNode', true ],
  [ 'SchemaRenameNodeProp', true ],
  [ 'SchemaRenameRelationship', true ],
  [ 'SchemaRenameRelationshipProp', true ],

  // Schema Delete
  [ 'SchemaDeleteNodes', true ],
  [ 'SchemaDeleteNodeProps', true ],
  [ 'SchemaDeleteRelationships', true ],
  [ 'SchemaDeleteRelationshipProps', true ],

  // Schema Update Prop
  [ 'SchemaUpdatePropDefault', true ],
  [ 'SchemaUpdatePropMustBeDefined', true ],
  [ 'SchemaUpdatePropSortIndex', true ],
  [ 'SchemaUpdatePropUniqueIndex', true ],
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
