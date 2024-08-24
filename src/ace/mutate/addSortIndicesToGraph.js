import { td } from '#ace'
import { graphSort } from '../graphSort.js'
import { Memory } from '../../objects/Memory.js'
import { write, getOne, getMany } from '../../util/storage.js'
import { getNodeIdsKey, getRelationship_IdsKey } from '../../util/variables.js'


/** 
 * @param { td.AceFnOptions } options 
 * @returns { Promise<void> }
 */
export async function addSortIndicesToGraph (options) {
  if (Memory.txn.sortIndexMap.size) {
    /** @type { { [nodeOrRelationshipName: string]: (td.AceGraphNode | td.AceGraphRelationship)[] } } */
    const allGraphItems = {}

    for (const entry of Memory.txn.sortIndexMap) {
      // Find nodes in sort array OR find nodes in all nodes or all relationships index OR default to empty array
      let graphIdsArray = /** @type { td.AceGraphIndex | undefined } */ (await getOne(entry[0]))

      if (!graphIdsArray) {
        if (entry[1].schemaProp.is === 'Prop') graphIdsArray = /** @type { td.AceGraphIndex | undefined } */ (await getOne(getNodeIdsKey(entry[1].nodeOrRelationshipName)))
        else graphIdsArray = /** @type { td.AceGraphIndex | undefined } */ (await getOne(getRelationship_IdsKey(entry[1].nodeOrRelationshipName)))
      }

      const index = Array.isArray(graphIdsArray?.index) ? graphIdsArray.index : []
      const allKeysSet = new Set(index.concat(entry[1].newIds))

      if (!allGraphItems[entry[1].nodeOrRelationshipName]) allGraphItems[entry[1].nodeOrRelationshipName] = /** @type { (td.AceGraphNode | td.AceGraphRelationship)[] } */ (await getMany([...allKeysSet]))
      const propName = entry[1].propName
      const dataType = entry[1].schemaProp.options.dataType

      if (dataType !== 'hash' && dataType !== 'encrypt') {
        allGraphItems[entry[1].nodeOrRelationshipName].sort((a, b) => { // order ascending
          return graphSort(a[propName], b[propName], dataType, 'asc')
        })
      }

      const keys = allGraphItems[entry[1].nodeOrRelationshipName].map(graphItem => graphItem.$aK)
      write({ $aA: 'upsert', $aK: entry[0], index: keys })
    }
  }
}
