import { Address, Bytes } from '@graphprotocol/graph-ts';

export function getPartnerTokenId(partner: Address, token: Address): Bytes {
  return partner.concat(token);
}
