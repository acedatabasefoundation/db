import { td } from '#ace'
import { graphSort } from '../graphSort.js'
import { Memory } from '../../objects/Memory.js'
import { Collator } from '../../objects/Collator.js'
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

      if (dataType !== 'hash' && dataType !== 'encrypt') {
        const collator = Collator()

        allGraphItems.sort((a, b) => { // order ascending
          return graphSort(a.props[propName], b.props[propName], collator, dataType, 'asc')
        })
      }

      const keys = (entry[1].schemaProp.is === 'Prop') ?
        allGraphItems.map(graphItem => graphItem.props.id) :
        allGraphItems.map(graphItem => graphItem.props._id)

      write('upsert', entry[0], keys)
    }
  }
}
