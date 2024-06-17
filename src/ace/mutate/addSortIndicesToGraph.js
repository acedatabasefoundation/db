import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { write, getOne, getMany } from '../../util/storage.js'
import { getNodeIdsKey, getRelationship_IdsKey } from '../../util/variables.js'


/** @returns { Promise<void> } */
export async function addSortIndicesToGraph () {
  if (Memory.txn.sortIndexMap.size) {
    for (const entry of Memory.txn.sortIndexMap) {
      /** @type { (string | number)[] } 1) Find nodes in sort array OR find nodes in all nodes or all relationships index OR default to empty array */
      const graphIdsArray = await getOne(entry[0]) || (entry[1].schemaProp.is === 'Prop' ? await getOne(getNodeIdsKey(entry[1].nodeOrRelationshipName)) : await getOne(getRelationship_IdsKey(entry[1].nodeOrRelationshipName))) || []
      const allKeysSet = new Set(graphIdsArray.concat(entry[1].newIds))

      /** @type { (td.AceGraphNode | td.AceGraphRelationship)[] } */
      const allGraphItems = await getMany([ ...allKeysSet ])
      const propName = entry[1].propName
      const dataType = entry[1].schemaProp.options.dataType

      if (dataType !== 'hash') {
        allGraphItems.sort((a, b) => { // order ascending
          if (typeof a.props[propName] === 'undefined' && typeof b.props[propName] === 'undefined') return 0 // both undefined => equal
          else if (typeof a.props[propName] === 'undefined' && typeof b.props[propName] !== 'undefined') return 1 // a undefined => b comes first (undefined @ end)
          else if (typeof a.props[propName] !== 'undefined' && typeof b.props[propName] === 'undefined') return -1 // b undefined => a comes first (undefined @ end)
          else { // a and b defined
            switch (dataType) {
              case 'string':
                return (a.props[propName]).localeCompare(b.props[propName])
              case 'iso':
              case 'number':
              case 'boolean':
                return Number(a.props[propName] > b.props[propName]) - Number(a.props[propName] < b.props[propName])
            }
          }
        })
      }

      const keys = (entry[1].schemaProp.is === 'Prop') ?
        allGraphItems.map(graphItem => graphItem.props.id) :
        allGraphItems.map(graphItem => graphItem.props._id)

      write('upsert', entry[0], keys)
    }
  }
}
