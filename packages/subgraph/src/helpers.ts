import { Address, BigDecimal, BigInt, TypedMap, ethereum } from '@graphprotocol/graph-ts';
import { BIGINT_TEN, ZERO_ADDRESS } from './constants';

export function getEventId(event: ethereum.Event): string {
  return event.transaction.hash.toHexString() + '-' + event.logIndex.toString();
}

export function isZeroAddress(address: Address): boolean {
  return address.equals(ZERO_ADDRESS);
}

export function amountToDecimal(amount: BigInt, decimals: number): BigDecimal {
  return amount.toBigDecimal().div(new BigDecimal(BIGINT_TEN.pow(u8(decimals))));
}

export function addressFromHex(hex: string): Address {
  return Address.fromBytes(Address.fromString(hex));
}

// NOTE: Implemented as a class since there's no closure support in AssemblyScript
export class Memoizer<K, V> {
  private cache: TypedMap<K, V> = new TypedMap<K, V>();

  constructor(private fn: (key: K) => V) {}

  get(key: K): V {
    if (this.cache.isSet(key)) {
      return this.cache.get(key)!;
    }

    const value = this.fn(key);

    this.cache.set(key, value);

    return value;
  }
}
