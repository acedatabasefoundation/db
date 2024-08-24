import { td } from '#ace'
import { AceError } from '../../objects/AceError.js'
import { write, getMany } from '../../util/storage.js'


/**
 * @param { td.AceMutateRequestItemNodePropDelete } reqItem
 * @returns { Promise<void> }
 */
export async function deleteNodeProps (reqItem) {
  if (!Array.isArray(reqItem?.how?.ids) || !reqItem.how.ids.length) throw new AceError('deleteNodeProps__invalidIds', 'Please ensure reqItem.how.ids is an array with more then one item, this is not happening yet for the reqItem:', { reqItem })
  if (!Array.isArray(reqItem?.how?.props) || !reqItem.how.props.length) throw new AceError('deleteNodeProps__invalidProps', 'Please ensure reqItem.how.props is an array with more then one item, this is not happening yet for the reqItem:', { reqItem })
  if (reqItem.how.props.includes('id')) throw new AceError('deleteNodeProps__invalidId', 'Please ensure reqItem.how.props does not include id, this is not happening yet for the reqItem:', { reqItem })

  const graphNodes = /** @type { td.AceGraphNode[] } */ (await getMany(reqItem.how.ids));

  for (let i = 0; i < graphNodes.length; i++) {
    for (let j = 0; j < reqItem.how.props.length; j++) {
      if (typeof graphNodes[i][reqItem.how.props[j]] !== 'undefined') {
        delete graphNodes[i][reqItem.how.props[j]]
        graphNodes[i].$aA = 'update'
        write(graphNodes[i])
      }
    }
  }
}
