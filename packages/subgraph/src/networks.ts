import { Address, TypedMap } from '@graphprotocol/graph-ts';
import { addressFromHex } from './helpers';

export const PRICE_ORACLES = new TypedMap<string, Address>();
PRICE_ORACLES.set('mainnet', addressFromHex('0x0addd25a91563696d8567df78d5a01c9a991f9b8'));
PRICE_ORACLES.set('arbitrum-one', addressFromHex('0x0addd25a91563696d8567df78d5a01c9a991f9b8'));
PRICE_ORACLES.set('optimism', addressFromHex('0x0addd25a91563696d8567df78d5a01c9a991f9b8'));
PRICE_ORACLES.set('bsc', addressFromHex('0x0addd25a91563696d8567df78d5a01c9a991f9b8'));
PRICE_ORACLES.set('matic', addressFromHex('0x0addd25a91563696d8567df78d5a01c9a991f9b8'));
PRICE_ORACLES.set('avalanche', addressFromHex('0x0addd25a91563696d8567df78d5a01c9a991f9b8'));
PRICE_ORACLES.set('base', addressFromHex('0x0addd25a91563696d8567df78d5a01c9a991f9b8'));

export const USD_ADDRESSES = new TypedMap<string, Address>();
USD_ADDRESSES.set('mainnet', addressFromHex('0x6b175474e89094c44da98b954eedeac495271d0f'));
USD_ADDRESSES.set('arbitrum-one', addressFromHex('0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'));
USD_ADDRESSES.set('optimism', addressFromHex('0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'));
USD_ADDRESSES.set('bsc', addressFromHex('0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'));
USD_ADDRESSES.set('matic', addressFromHex('0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'));
USD_ADDRESSES.set('avalanche', addressFromHex('0xd586e7f844cea2f87f50152665bcbc2c279d8d70'));
USD_ADDRESSES.set('base', addressFromHex('0x50c5725949a6f0c72e6c4a641f24049a917db0cb'));

export const NATIVE_SYMBOLS = new TypedMap<string, string>();
NATIVE_SYMBOLS.set('bsc', 'BNB');
NATIVE_SYMBOLS.set('matic', 'MATIC');
NATIVE_SYMBOLS.set('avalanche', 'AVAX');
