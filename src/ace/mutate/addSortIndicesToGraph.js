import { td } from '#ace'
import { Memory } from '../../objects/Memory.js'
import { getMany, getOne, write } from '../../util/storage.js'


/** @returns { Promise<void> } */
export async function addSortIndicesToGraph () {
  if (Memory.txn.sortIndexMap.size) {
    for (const entry of Memory.txn.sortIndexMap) {
      /** @type { (string | number)[] } */
      const graphIdsArray = await getOne(entry[0]) || []
      const allIdsSet = new Set(graphIdsArray.concat(entry[1].newIds))

      /** @type { Map<string | number, td.AceGraphNode | td.AceGraphRelationship> } */
      const allGraphItemsMap = await getMany([ ...allIdsSet ])

      const allNodesSorted = [ ...allGraphItemsMap.values() ].sort((a, b) => Number(a.props[entry[1].propName] > b.props[entry[1].propName]) - Number(a.props[entry[1].propName] < b.props[entry[1].propName])) // order ascending

      write('upsert', entry[0], allNodesSorted.map(graphItem => (graphItem.props.id || graphItem.props._id)))
    }
  }
}
