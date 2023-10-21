import { Address, BigInt } from '@graphprotocol/graph-ts';

export const CURRENT = 'current';
export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);
export const BIGINT_TEN = BigInt.fromI32(10);
export const BIGINT_EIGHTEEN = BigInt.fromI32(18);
export const BIGDECIMAL_ONE = BIGINT_ONE.toBigDecimal();
export const BIGDECIMAL_ZERO = BIGINT_ZERO.toBigDecimal();
export const ZERO_ADDRESS_HEX = '0x0000000000000000000000000000000000000000';
export const ZERO_ADDRESS = Address.fromBytes(Address.fromString(ZERO_ADDRESS_HEX));
