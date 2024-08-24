import { td } from '#ace'
import { encrypt } from '../../security/crypt.js'
import { AceError } from '../../objects/AceError.js'


/**
 * @param { 'node' | 'relationship' } type 
 * @param { string } nodeOrRelationshipName 
 * @param { td.AceMutateRequestItemNodeInsertProps | td.AceMutateRequestItemNodeUpdateProps | td.AceMutateRequestItemRelationshipInsertProps | td.AceMutateRequestItemRelationshipUpdateProps } props 
 * @param { string } propName 
 * @param { any } propValue 
 * @param { td.AceSchemaProp | td.AceSchemaRelationshipProp } schemaProp 
 * @param { td.AceFnCryptoJWKs } jwks 
 * @param { td.AceFnIVs } [ ivs ] 
 * @param { string } [ jwkName ]
 * @param { string } [ ivName ] 
 */
export async function encryptMutationProp (type, nodeOrRelationshipName, props, propName, propValue, schemaProp, jwks, ivs, jwkName, ivName) {
  if (schemaProp.options.dataType === 'encrypt') {
    if (!jwkName) throw new AceError('falsyOptionsCryptJwk', `Please ensure the ${ type } name "${ nodeOrRelationshipName }" with the prop name "${ propName }" has a reqItem.how.$o.cryptJWK. Example: reqItem.how.$o: { cryptJWK: 'password' }`, { propName, propValue })
    if (!jwks.crypt[jwkName]) throw new AceError('falsyRequestItemCryptJwk', `Please ensure the ${ type } name "${ nodeOrRelationshipName }" with the prop name "${ propName }" has reqItem.how.$o.cryptJWK[ name ] aligned with any ace() options.jwks[ name ]`, { propName, propValue })
    if (!ivName) throw new AceError('falsyOptionsIv', `Please ensure the ${ type } name "${ nodeOrRelationshipName }" with the prop name "${ propName }" has a reqItem.how.$o.iv. Example: reqItem.how.$o: { iv: 'crypt' }`, { propName, propValue })
    if (!ivs?.[ivName]) throw new AceError('falsyRequestItemIv', `Please ensure the ${ type } name "${ nodeOrRelationshipName }" with the prop name "${ propName }" has reqItem.how.$o.ivs[ name ] aligned with any ace() options.iv[ name ]`, { propName, propValue })
    
    props[propName] = await encrypt(propValue, jwks.crypt[jwkName], ivs[ivName])
  }
}
