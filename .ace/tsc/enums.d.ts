export type aceDo = "EmptyGraph" | "EmptyTrash" | "BackupGet" | "BackupLoad" | "PluginInstall" | "PluginUninstall" | "SchemaAdd" | "SchemaGet" | "SchemaPush" | "SchemaRenameNode" | "SchemaRenameNodeProp" | "SchemaRenameRelationship" | "SchemaRenameRelationshipProp" | "SchemaDeleteNodes" | "SchemaDeleteNodeProps" | "SchemaDeleteRelationships" | "SchemaDeleteRelationshipProps" | "SchemaUpdatePropDefault" | "SchemaUpdatePropMustBeDefined" | "SchemaUpdatePropSortIndex" | "SchemaUpdatePropUniqueIndex" | "SchemaUpdateNodePropCascade" | "SchemaUpdateNodePropHas" | "NodeInsert" | "NodeUpdate" | "NodeUpsert" | "NodeQuery" | "NodeDelete" | "NodePropDelete" | "RelationshipInsert" | "RelationshipUpdate" | "RelationshipUpsert" | "RelationshipQuery" | "RelationshipDelete" | "RelationshipPropDelete";
export namespace aceDo {
    let EmptyGraph: "EmptyGraph";
    let EmptyTrash: "EmptyTrash";
    let BackupGet: "BackupGet";
    let BackupLoad: "BackupLoad";
    let PluginInstall: "PluginInstall";
    let PluginUninstall: "PluginUninstall";
    let SchemaAdd: "SchemaAdd";
    let SchemaGet: "SchemaGet";
    let SchemaPush: "SchemaPush";
    let SchemaRenameNode: "SchemaRenameNode";
    let SchemaRenameNodeProp: "SchemaRenameNodeProp";
    let SchemaRenameRelationship: "SchemaRenameRelationship";
    let SchemaRenameRelationshipProp: "SchemaRenameRelationshipProp";
    let SchemaDeleteNodes: "SchemaDeleteNodes";
    let SchemaDeleteNodeProps: "SchemaDeleteNodeProps";
    let SchemaDeleteRelationships: "SchemaDeleteRelationships";
    let SchemaDeleteRelationshipProps: "SchemaDeleteRelationshipProps";
    let SchemaUpdatePropDefault: "SchemaUpdatePropDefault";
    let SchemaUpdatePropMustBeDefined: "SchemaUpdatePropMustBeDefined";
    let SchemaUpdatePropSortIndex: "SchemaUpdatePropSortIndex";
    let SchemaUpdatePropUniqueIndex: "SchemaUpdatePropUniqueIndex";
    let SchemaUpdateNodePropCascade: "SchemaUpdateNodePropCascade";
    let SchemaUpdateNodePropHas: "SchemaUpdateNodePropHas";
    let NodeInsert: "NodeInsert";
    let NodeUpdate: "NodeUpdate";
    let NodeUpsert: "NodeUpsert";
    let NodeQuery: "NodeQuery";
    let NodeDelete: "NodeDelete";
    let NodePropDelete: "NodePropDelete";
    let RelationshipInsert: "RelationshipInsert";
    let RelationshipUpdate: "RelationshipUpdate";
    let RelationshipUpsert: "RelationshipUpsert";
    let RelationshipQuery: "RelationshipQuery";
    let RelationshipDelete: "RelationshipDelete";
    let RelationshipPropDelete: "RelationshipPropDelete";
}
export type dataTypes = "hash" | "string" | "number" | "boolean" | "iso" | "encrypt";
export namespace dataTypes {
    let hash: "hash";
    let string: "string";
    let number: "number";
    let boolean: "boolean";
    let iso: "iso";
    let encrypt: "encrypt";
}
export type jwkTypes = "crypt" | "public" | "private";
export namespace jwkTypes {
    export let crypt: "crypt";
    let _public: "public";
    export { _public as public };
    let _private: "private";
    export { _private as private };
}
export type queryNewPropsSymbol = "add" | "subtract" | "multiply" | "divide";
export namespace queryNewPropsSymbol {
    let add: "add";
    let subtract: "subtract";
    let multiply: "multiply";
    let divide: "divide";
}
export type queryOptions = "countAsProp" | "sumAsProp" | "avgAsProp" | "minAmtAsProp" | "maxAmtAsProp" | "newProps" | "propAdjToRes" | "findByOr" | "findByAnd" | "findByDefined" | "findByUndefined" | "findByPropValue" | "findByPropProp" | "findByPropRes" | "filterByOr" | "filterByAnd" | "filterByDefined" | "filterByUndefined" | "filterByPropValue" | "filterByPropProp" | "filterByPropRes" | "sort" | "countAdjToRes" | "limit";
export namespace queryOptions {
    let countAsProp: "countAsProp";
    let sumAsProp: "sumAsProp";
    let avgAsProp: "avgAsProp";
    let minAmtAsProp: "minAmtAsProp";
    let maxAmtAsProp: "maxAmtAsProp";
    let newProps: "newProps";
    let propAdjToRes: "propAdjToRes";
    let findByOr: "findByOr";
    let findByAnd: "findByAnd";
    let findByDefined: "findByDefined";
    let findByUndefined: "findByUndefined";
    let findByPropValue: "findByPropValue";
    let findByPropProp: "findByPropProp";
    let findByPropRes: "findByPropRes";
    let filterByOr: "filterByOr";
    let filterByAnd: "filterByAnd";
    let filterByDefined: "filterByDefined";
    let filterByUndefined: "filterByUndefined";
    let filterByPropValue: "filterByPropValue";
    let filterByPropProp: "filterByPropProp";
    let filterByPropRes: "filterByPropRes";
    let sort: "sort";
    let countAdjToRes: "countAdjToRes";
    let limit: "limit";
}
export type postQueryOptions = "resHide" | "propAsRes" | "countAsRes" | "sumAsRes" | "avgAsRes" | "minAmtAsRes" | "maxAmtAsRes" | "minNodeAsRes" | "maxNodeAsRes";
export namespace postQueryOptions {
    let resHide: "resHide";
    let propAsRes: "propAsRes";
    let countAsRes: "countAsRes";
    let sumAsRes: "sumAsRes";
    let avgAsRes: "avgAsRes";
    let minAmtAsRes: "minAmtAsRes";
    let maxAmtAsRes: "maxAmtAsRes";
    let minNodeAsRes: "minNodeAsRes";
    let maxNodeAsRes: "maxNodeAsRes";
}
export type queryWhereGroupSymbol = "or" | "and";
export namespace queryWhereGroupSymbol {
    let or: "or";
    let and: "and";
}
export type queryWhereSymbol = "equals" | "doesNotEqual" | "greaterThan" | "lessThan" | "greaterThanOrEqualTo" | "lessThanOrEqualTo" | "startsWith" | "endsWith" | "contains" | "doesNotContain" | "isoIsBefore" | "isoIsAfter";
export namespace queryWhereSymbol {
    let equals: "equals";
    let doesNotEqual: "doesNotEqual";
    let greaterThan: "greaterThan";
    let lessThan: "lessThan";
    let greaterThanOrEqualTo: "greaterThanOrEqualTo";
    let lessThanOrEqualTo: "lessThanOrEqualTo";
    let startsWith: "startsWith";
    let endsWith: "endsWith";
    let contains: "contains";
    let doesNotContain: "doesNotContain";
    let isoIsBefore: "isoIsBefore";
    let isoIsAfter: "isoIsAfter";
}
export type schemaHas = "one" | "many";
export namespace schemaHas {
    let one: "one";
    let many: "many";
}
export type schemaIs = "Prop" | "RelationshipProp" | "ForwardRelationshipProp" | "ReverseRelationshipProp" | "BidirectionalRelationshipProp" | "OneToOne" | "OneToMany" | "ManyToMany";
export namespace schemaIs {
    let Prop: "Prop";
    let RelationshipProp: "RelationshipProp";
    let ForwardRelationshipProp: "ForwardRelationshipProp";
    let ReverseRelationshipProp: "ReverseRelationshipProp";
    let BidirectionalRelationshipProp: "BidirectionalRelationshipProp";
    let OneToOne: "OneToOne";
    let OneToMany: "OneToMany";
    let ManyToMany: "ManyToMany";
}
export type sortHow = "asc" | "dsc";
export namespace sortHow {
    let asc: "asc";
    let dsc: "dsc";
}
export type txnDo = "Start" | "Complete" | "Cancel";
export namespace txnDo {
    let Start: "Start";
    let Complete: "Complete";
    let Cancel: "Cancel";
}
export type txnSteps = "preEnter" | "lastReq" | "notLastReq" | "respondedAndWaiting";
export namespace txnSteps {
    let preEnter: "preEnter";
    let lastReq: "lastReq";
    let notLastReq: "notLastReq";
    let respondedAndWaiting: "respondedAndWaiting";
}
export type writeAction = "insert" | "update" | "upsert" | "delete";
export namespace writeAction {
    export let insert: "insert";
    export let update: "update";
    export let upsert: "upsert";
    let _delete: "delete";
    export { _delete as delete };
}
