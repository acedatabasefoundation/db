import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { write, getOne, getMany } from '../../util/storage.js'
import { getNodeIdsKey, getRelationshipIdsKey } from '../../util/variables.js'


/** @returns { Promise<void> } */
export async function addSortIndicesToGraph () {
  if (Memory.txn.sortIndexMap.size) {
    for (const entry of Memory.txn.sortIndexMap) {
      /** @type { (string | number)[] } */
      const graphIdsArray = await getOne(entry[0]) || (entry[1].schemaProp.is === 'Prop' ? await getOne(getNodeIdsKey(entry[1].nodeOrRelationshipName)) : await getOne(getRelationshipIdsKey(entry[1].nodeOrRelationshipName))) || []
      const allIdsSet = new Set(graphIdsArray.concat(entry[1].newIds))

      /** @type { Map<string | number, td.AceGraphNode | td.AceGraphRelationship> } */
      const allGraphItemsMap = await getMany([ ...allIdsSet ])
      const propName = entry[1].propName
      const dataType = entry[1].schemaProp.options.dataType
      const values = [ ...allGraphItemsMap.values() ]

      if (dataType !== 'hash') {
        values.sort((a, b) => { // order ascending
          if (typeof a.props[propName] === 'undefined' && typeof b.props[propName] === 'undefined') return 0 // both undefined => equal
          else if (typeof a.props[propName] === 'undefined' && typeof b.props[propName] !== 'undefined') return 1 // a undefined => b comes first (undefined @ end)
          else if (typeof a.props[propName] !== 'undefined' && typeof b.props[propName] === 'undefined') return -1 // b undefined => a comes first (undefined @ end)
          else {
            switch (dataType) {
              case 'string':
                return (a.props[propName]).localeCompare(b.props[propName])
              case 'number':
              case 'boolean':
              case 'isoString':
                return Number(a.props[propName] > b.props[propName]) - Number(a.props[propName] < b.props[propName])
            }
          }
        })
      }

      write('upsert', entry[0], values.map(graphItem => (graphItem.props.id || graphItem.props._id)))
    }
  }
}
