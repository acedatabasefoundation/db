export const aceDo = new Map([ // boolean is will this id write to the graph
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

  // Schema Update Prop
  [ 'SchemaUpdatePropDataType', true ],
  [ 'SchemaUpdatePropMustBeDefined', true ],
  [ 'SchemaUpdatePropCascade', true ],
  [ 'SchemaUpdatePropIndex', true ],
  [ 'SchemaUpdatePropHas', true ],

  // Node
  [ 'NodeInsert', true ],
  [ 'NodeUpdate', true ],
  [ 'NodeUpsert', true ],
  [ 'NodeQuery', false ],
  [ 'NodeDeleteData', true ],
  [ 'NodePropDeleteData', true ],
  [ 'NodeDeleteDataAndDeleteFromSchema', true ],
  [ 'NodePropDeleteDataAndDeleteFromSchema', true ],

  // Relationship
  [ 'RelationshipInsert', true ],
  [ 'RelationshipUpdate', true ],
  [ 'RelationshipUpsert', true ],
  [ 'RelationshipQuery', false ],
  [ 'RelationshipDeleteData', true ],
  [ 'RelationshipPropDeleteData', true ],
  [ 'RelationshipDeleteDataAndDeleteFromSchema', true ],
  [ 'RelationshipPropDeleteDataAndDeleteFromSchema', true ],
])


export const aceDoUpdateSet = new Set()


for (const entry of aceDo) {
  if (entry[1]) {
    aceDoUpdateSet.add(entry[0])
  }
}
