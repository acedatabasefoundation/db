import { td } from '#ace'
import { sign } from '../../security/hash.js'
import { AceError } from '../../objects/AceError.js'


/**
 * @param { 'node' | 'relationship' } type 
 * @param { string } nodeOrRelationshipName 
 * @param { td.AceMutateRequestItemNodeInsertProps | td.AceMutateRequestItemNodeUpdateProps | td.AceMutateRequestItemRelationshipInsertProps | td.AceMutateRequestItemRelationshipUpdateProps } props 
 * @param { string } propName 
 * @param { any } propValue 
 * @param { td.AceSchemaProp | td.AceSchemaRelationshipProp } schemaProp 
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { string } [ jwkName ]
 */
export async function hashMutationProp (type, nodeOrRelationshipName, props, propName, propValue, schemaProp, jwks, jwkName) {
  if (schemaProp.options.dataType === 'hash') {
    if (!jwkName) throw new AceError('falsyOptionsPrivateJwk', `Please ensure the ${ type } name "${ nodeOrRelationshipName }" with the prop name "${ propName }" has a reqItem.how.$o.privateJWK. Example: reqItem.how.$o: { privateJWK: 'password' }`, { propName, propValue })
    if (!jwks.private[jwkName]) throw new AceError('falsyRequestItemPrivateJwk', `Please ensure the ${ type } name "${ nodeOrRelationshipName }" with the prop name "${ propName }" has reqItem.how.$o.privateJWK[ name ] aligned with any ace() options.jwks[ name ]`, { propName, propValue })

    props[propName] = await sign(propValue, jwks.private[jwkName])
  }
}
