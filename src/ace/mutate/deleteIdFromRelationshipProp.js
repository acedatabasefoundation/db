import { td } from '#ace'
import { write } from '../../util/storage.js'
import { AceError } from '../../objects/AceError.js'


/**
 * @param { string } prop 
 * @param { string | number } _id 
 * @param { td.AceGraphNode } relationshipNode
 * @returns { Promise<void> }
 */
export async function deleteIdFromRelationshipProp (prop, _id, relationshipNode) {
  if (!Array.isArray(relationshipNode?.[prop])) throw AceError('aceFn__deleteIdFromRelationshipProp__notArray', 'Please ensure relationshipNode[prop] is an array', { relationshipNode, prop })

  if (relationshipNode[prop].length === 1 && relationshipNode[prop][0] === _id) delete relationshipNode[prop]
  else {
    for (let i = relationshipNode[prop].length - 1; i >= 0; i--) {
      if (_id === relationshipNode[prop][i]) relationshipNode[prop].splice(i, 1)
    }

    if (!relationshipNode[prop].length) delete relationshipNode[prop]
  }

  write('update', relationshipNode.props.id, relationshipNode)
}
