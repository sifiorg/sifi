import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { BIGINT_TEN, ZERO_ADDRESS } from './constants';

export function getEventId(event: ethereum.Event): string {
  return event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
}

export function isZeroAddress(address: Address): boolean {
  return address.toHexString() == ZERO_ADDRESS;
}

export function amountToDecimal(amount: BigInt, decimals: number): BigDecimal {
  return amount.toBigDecimal().div(new BigDecimal(BIGINT_TEN.pow(u8(decimals))));
}
