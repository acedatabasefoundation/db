/** @typedef { 'EmptyGraph' | 'EmptyTrash' | 'BackupGet' | 'BackupLoad' | 'PluginInstall' | 'PluginUninstall' | 'SchemaAdd' | 'SchemaGet' | 'SchemaPush' | 'SchemaRenameNode' | 'SchemaRenameNodeProp' | 'SchemaRenameRelationship' | 'SchemaRenameRelationshipProp' | 'SchemaDeleteNodes' | 'SchemaDeleteNodeProps' | 'SchemaDeleteRelationships' | 'SchemaDeleteRelationshipProps' | 'SchemaUpdatePropDefault' | 'SchemaUpdatePropMustBeDefined' | 'SchemaUpdatePropSortIndex' | 'SchemaUpdatePropUniqueIndex' | 'SchemaUpdateNodePropCascade' | 'SchemaUpdateNodePropHas' | 'NodeInsert' | 'NodeUpdate' | 'NodeUpsert' | 'NodeQuery' | 'NodeDelete' | 'NodePropDelete' | 'RelationshipInsert' | 'RelationshipUpdate' | 'RelationshipUpsert' | 'RelationshipQuery' | 'RelationshipDelete' | 'RelationshipPropDelete' } aceDo */
export const aceDo = {
  EmptyGraph: /** @type { 'EmptyGraph' } */ ('EmptyGraph'),
  EmptyTrash: /** @type { 'EmptyTrash' } */ ('EmptyTrash'),
  BackupGet: /** @type { 'BackupGet' } */ ('BackupGet'),
  BackupLoad: /** @type { 'BackupLoad' } */ ('BackupLoad'),
  PluginInstall: /** @type { 'PluginInstall' } */ ('PluginInstall'),
  PluginUninstall: /** @type { 'PluginUninstall' } */ ('PluginUninstall'),
  SchemaAdd: /** @type { 'SchemaAdd' } */ ('SchemaAdd'),
  SchemaGet: /** @type { 'SchemaGet' } */ ('SchemaGet'),
  SchemaPush: /** @type { 'SchemaPush' } */ ('SchemaPush'),
  SchemaRenameNode: /** @type { 'SchemaRenameNode' } */ ('SchemaRenameNode'),
  SchemaRenameNodeProp: /** @type { 'SchemaRenameNodeProp' } */ ('SchemaRenameNodeProp'),
  SchemaRenameRelationship: /** @type { 'SchemaRenameRelationship' } */ ('SchemaRenameRelationship'),
  SchemaRenameRelationshipProp: /** @type { 'SchemaRenameRelationshipProp' } */ ('SchemaRenameRelationshipProp'),
  SchemaDeleteNodes: /** @type { 'SchemaDeleteNodes' } */ ('SchemaDeleteNodes'),
  SchemaDeleteNodeProps: /** @type { 'SchemaDeleteNodeProps' } */ ('SchemaDeleteNodeProps'),
  SchemaDeleteRelationships: /** @type { 'SchemaDeleteRelationships' } */ ('SchemaDeleteRelationships'),
  SchemaDeleteRelationshipProps: /** @type { 'SchemaDeleteRelationshipProps' } */ ('SchemaDeleteRelationshipProps'),
  SchemaUpdatePropDefault: /** @type { 'SchemaUpdatePropDefault' } */ ('SchemaUpdatePropDefault'),
  SchemaUpdatePropMustBeDefined: /** @type { 'SchemaUpdatePropMustBeDefined' } */ ('SchemaUpdatePropMustBeDefined'),
  SchemaUpdatePropSortIndex: /** @type { 'SchemaUpdatePropSortIndex' } */ ('SchemaUpdatePropSortIndex'),
  SchemaUpdatePropUniqueIndex: /** @type { 'SchemaUpdatePropUniqueIndex' } */ ('SchemaUpdatePropUniqueIndex'),
  SchemaUpdateNodePropCascade: /** @type { 'SchemaUpdateNodePropCascade' } */ ('SchemaUpdateNodePropCascade'),
  SchemaUpdateNodePropHas: /** @type { 'SchemaUpdateNodePropHas' } */ ('SchemaUpdateNodePropHas'),
  NodeInsert: /** @type { 'NodeInsert' } */ ('NodeInsert'),
  NodeUpdate: /** @type { 'NodeUpdate' } */ ('NodeUpdate'),
  NodeUpsert: /** @type { 'NodeUpsert' } */ ('NodeUpsert'),
  NodeQuery: /** @type { 'NodeQuery' } */ ('NodeQuery'),
  NodeDelete: /** @type { 'NodeDelete' } */ ('NodeDelete'),
  NodePropDelete: /** @type { 'NodePropDelete' } */ ('NodePropDelete'),
  RelationshipInsert: /** @type { 'RelationshipInsert' } */ ('RelationshipInsert'),
  RelationshipUpdate: /** @type { 'RelationshipUpdate' } */ ('RelationshipUpdate'),
  RelationshipUpsert: /** @type { 'RelationshipUpsert' } */ ('RelationshipUpsert'),
  RelationshipQuery: /** @type { 'RelationshipQuery' } */ ('RelationshipQuery'),
  RelationshipDelete: /** @type { 'RelationshipDelete' } */ ('RelationshipDelete'),
  RelationshipPropDelete: /** @type { 'RelationshipPropDelete' } */ ('RelationshipPropDelete'),
}


/** @typedef { 'hash' | 'string' | 'number' | 'boolean' | 'iso' | 'encrypt' } dataTypes */
export const dataTypes = {
  hash: /** @type { 'hash' } */ ('hash'),
  string: /** @type { 'string' } */ ('string'),
  number: /** @type { 'number' } */ ('number'),
  boolean: /** @type { 'boolean' } */ ('boolean'),
  iso: /** @type { 'iso' } */ ('iso'),
  encrypt: /** @type { 'encrypt' } */ ('encrypt'),
}


/** @typedef { 'crypt' | 'public' | 'private' } jwkTypes */
export const jwkTypes = {
  crypt: /** @type { 'crypt' } */ ('crypt'),
  public: /** @type { 'public' } */ ('public'),
  private: /** @type { 'private' } */ ('private'),
}


/** @typedef { 'add' | 'subtract' | 'multiply' | 'divide' } queryNewPropsSymbol */
export const queryNewPropsSymbol = {
  add: /** @type { 'add' } */ ('add'),
  subtract: /** @type { 'subtract' } */ ('subtract'),
  multiply: /** @type { 'multiply' } */ ('multiply'),
  divide: /** @type { 'divide' } */ ('divide'),
}


/** @typedef { 'countAsProp' | 'sumAsProp' | 'avgAsProp' | 'minAmtAsProp' | 'maxAmtAsProp' | 'newProps' | 'propAdjToRes' | 'findByOr' | 'findByAnd' | 'findByDefined' | 'findByUndefined' | 'findByPropValue' | 'findByPropProp' | 'findByPropRes' | 'filterByOr' | 'filterByAnd' | 'filterByDefined' | 'filterByUndefined' | 'filterByPropValue' | 'filterByPropProp' | 'filterByPropRes' | 'sort' | 'countAdjToRes' | 'limit' } queryOptions */
export const queryOptions = {
  countAsProp: /** @type { 'countAsProp' } */ ('countAsProp'),
  sumAsProp: /** @type { 'sumAsProp' } */ ('sumAsProp'),
  avgAsProp: /** @type { 'avgAsProp' } */ ('avgAsProp'),
  minAmtAsProp: /** @type { 'minAmtAsProp' } */ ('minAmtAsProp'),
  maxAmtAsProp: /** @type { 'maxAmtAsProp' } */ ('maxAmtAsProp'),
  newProps: /** @type { 'newProps' } */ ('newProps'),
  propAdjToRes: /** @type { 'propAdjToRes' } */ ('propAdjToRes'),
  findByOr: /** @type { 'findByOr' } */ ('findByOr'),
  findByAnd: /** @type { 'findByAnd' } */ ('findByAnd'),
  findByDefined: /** @type { 'findByDefined' } */ ('findByDefined'),
  findByUndefined: /** @type { 'findByUndefined' } */ ('findByUndefined'),
  findByPropValue: /** @type { 'findByPropValue' } */ ('findByPropValue'),
  findByPropProp: /** @type { 'findByPropProp' } */ ('findByPropProp'),
  findByPropRes: /** @type { 'findByPropRes' } */ ('findByPropRes'),
  filterByOr: /** @type { 'filterByOr' } */ ('filterByOr'),
  filterByAnd: /** @type { 'filterByAnd' } */ ('filterByAnd'),
  filterByDefined: /** @type { 'filterByDefined' } */ ('filterByDefined'),
  filterByUndefined: /** @type { 'filterByUndefined' } */ ('filterByUndefined'),
  filterByPropValue: /** @type { 'filterByPropValue' } */ ('filterByPropValue'),
  filterByPropProp: /** @type { 'filterByPropProp' } */ ('filterByPropProp'),
  filterByPropRes: /** @type { 'filterByPropRes' } */ ('filterByPropRes'),
  sort: /** @type { 'sort' } */ ('sort'),
  countAdjToRes: /** @type { 'countAdjToRes' } */ ('countAdjToRes'),
  limit: /** @type { 'limit' } */ ('limit'),
}


/** @typedef { 'resHide' | 'propAsRes' | 'countAsRes' | 'sumAsRes' | 'avgAsRes' | 'minAmtAsRes' | 'maxAmtAsRes' | 'minNodeAsRes' | 'maxNodeAsRes' } postQueryOptions */
export const postQueryOptions = {
  resHide: /** @type { 'resHide' } */ ('resHide'),
  propAsRes: /** @type { 'propAsRes' } */ ('propAsRes'),
  countAsRes: /** @type { 'countAsRes' } */ ('countAsRes'),
  sumAsRes: /** @type { 'sumAsRes' } */ ('sumAsRes'),
  avgAsRes: /** @type { 'avgAsRes' } */ ('avgAsRes'),
  minAmtAsRes: /** @type { 'minAmtAsRes' } */ ('minAmtAsRes'),
  maxAmtAsRes: /** @type { 'maxAmtAsRes' } */ ('maxAmtAsRes'),
  minNodeAsRes: /** @type { 'minNodeAsRes' } */ ('minNodeAsRes'),
  maxNodeAsRes: /** @type { 'maxNodeAsRes' } */ ('maxNodeAsRes'),
}


/** @typedef { 'or' | 'and' } queryWhereGroupSymbol */
export const queryWhereGroupSymbol = {
  or: /** @type { 'or' } */ ('or'),
  and: /** @type { 'and' } */ ('and'),
}


/** @typedef { 'equals' | 'doesNotEqual' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqualTo' | 'lessThanOrEqualTo' | 'startsWith' | 'endsWith' | 'contains' | 'doesNotContain' | 'isoIsBefore' | 'isoIsAfter' } queryWhereSymbol */
export const queryWhereSymbol = {
  equals: /** @type { 'equals' } */ ('equals'),
  doesNotEqual: /** @type { 'doesNotEqual' } */ ('doesNotEqual'),
  greaterThan: /** @type { 'greaterThan' } */ ('greaterThan'),
  lessThan: /** @type { 'lessThan' } */ ('lessThan'),
  greaterThanOrEqualTo: /** @type { 'greaterThanOrEqualTo' } */ ('greaterThanOrEqualTo'),
  lessThanOrEqualTo: /** @type { 'lessThanOrEqualTo' } */ ('lessThanOrEqualTo'),
  startsWith: /** @type { 'startsWith' } */ ('startsWith'),
  endsWith: /** @type { 'endsWith' } */ ('endsWith'),
  contains: /** @type { 'contains' } */ ('contains'),
  doesNotContain: /** @type { 'doesNotContain' } */ ('doesNotContain'),
  isoIsBefore: /** @type { 'isoIsBefore' } */ ('isoIsBefore'),
  isoIsAfter: /** @type { 'isoIsAfter' } */ ('isoIsAfter'),
}


/** @typedef { 'one' | 'many' } schemaHas */
export const schemaHas = {
  one: /** @type { 'one' } */ ('one'),
  many: /** @type { 'many' } */ ('many'),
}


/** @typedef { 'Prop' | 'RelationshipProp' | 'ForwardRelationshipProp' | 'ReverseRelationshipProp' | 'BidirectionalRelationshipProp' | 'OneToOne' | 'OneToMany' | 'ManyToMany' } schemaIs */
export const schemaIs = {
  Prop: /** @type { 'Prop' } */ ('Prop'),
  RelationshipProp: /** @type { 'RelationshipProp' } */ ('RelationshipProp'),
  ForwardRelationshipProp: /** @type { 'ForwardRelationshipProp' } */ ('ForwardRelationshipProp'),
  ReverseRelationshipProp: /** @type { 'ReverseRelationshipProp' } */ ('ReverseRelationshipProp'),
  BidirectionalRelationshipProp: /** @type { 'BidirectionalRelationshipProp' } */ ('BidirectionalRelationshipProp'),
  OneToOne: /** @type { 'OneToOne' } */ ('OneToOne'),
  OneToMany: /** @type { 'OneToMany' } */ ('OneToMany'),
  ManyToMany: /** @type { 'ManyToMany' } */ ('ManyToMany'),
}


/** @typedef { 'asc' | 'dsc' } sortHow */
export const sortHow = {
  asc: /** @type { 'asc' } */ ('asc'),
  dsc: /** @type { 'dsc' } */ ('dsc'),
}


/** @typedef { 'Start' | 'Complete' | 'Cancel' } txnDo */
export const txnDo = {
  Start: /** @type { 'Start' } */ ('Start'),
  Complete: /** @type { 'Complete' } */ ('Complete'),
  Cancel: /** @type { 'Cancel' } */ ('Cancel'),
}


/** @typedef { 'preEnter' | 'lastReq' | 'notLastReq' | 'respondedAndWaiting' } txnSteps */
export const txnSteps = {
  preEnter: /** @type { 'preEnter' } */ ('preEnter'),
  lastReq: /** @type { 'lastReq' } */ ('lastReq'),
  notLastReq: /** @type { 'notLastReq' } */ ('notLastReq'),
  respondedAndWaiting: /** @type { 'respondedAndWaiting' } */ ('respondedAndWaiting'),
}


/** @typedef { 'insert' | 'update' | 'upsert' | 'delete' } writeDo */
export const writeDo = {
  insert: /** @type { 'insert' } */ ('insert'),
  update: /** @type { 'update' } */ ('update'),
  upsert: /** @type { 'upsert' } */ ('upsert'),
  delete: /** @type { 'delete' } */ ('delete'),
}