import { td } from '#ace'
import { AceError } from '../../objects/AceError.js'
import { write, getMany } from '../../util/storage.js'


/**
 * @param { td.AceMutateRequestItemNodePropDelete } reqItem
 * @returns { Promise<void> }
 */
export async function deleteNodePropsById (reqItem) {
  if (!Array.isArray(reqItem?.how?.ids) || !reqItem.how.ids.length) throw AceError('aceFn__deleteNodePropsById__invalidIds', 'Please ensure reqItem.how.ids is an array with more then one item, this is not happening yet for the reqItem:', { reqItem })
  if (!Array.isArray(reqItem?.how?.props) || !reqItem.how.props.length) throw AceError('aceFn__deleteNodePropsById__invalidProps', 'Please ensure reqItem.how.props is an array with more then one item, this is not happening yet for the reqItem:', { reqItem })
  if (reqItem.how.props.includes('id')) throw AceError('aceFn__deleteNodePropsById__invalidId', 'Please ensure reqItem.how.props does not include id, this is not happening yet for the reqItem:', { reqItem })

  /** @type { Map<string | number, td.AceGraphNode> } */
  const graphNodes = await getMany(reqItem.how.ids)

  for (const entry of graphNodes) {
    for (const propName of reqItem.how.props) {
      if (typeof entry[1].props[propName] !== 'undefined') {
        delete entry[1].props[propName]
        write('update', entry[0], entry[1])
      }
    }
  }
}
