import { log } from '@graphprotocol/graph-ts';
import { Address, BigDecimal, BigInt, TypedMap, dataSource } from '@graphprotocol/graph-ts';
import { TokenInfo } from './tokens';
import { OffchainOracle } from '../../generated/SifiDiamond/OffchainOracle';
import { BIGINT_TEN } from '../constants';
import { amountToDecimal } from '../helpers';

const OFFCHAIN_ORACLE_ADDRESSES = new TypedMap<string, string>();
OFFCHAIN_ORACLE_ADDRESSES.set('mainnet', '0x3E1Fe1Bd5a5560972bFa2D393b9aC18aF279fF56');
OFFCHAIN_ORACLE_ADDRESSES.set('arbitrum-one', '0x59Bc892E1832aE86C268fC21a91fE940830a52b0');

const DAI_ADDRESSES = new TypedMap<string, string>();
DAI_ADDRESSES.set('mainnet', '0x6b175474e89094c44da98b954eedeac495271d0f');
DAI_ADDRESSES.set('arbitrum-one', '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1');

export function getRateToEth(tokenAddress: Address): BigDecimal | null {
  const network = dataSource.network();

  const oracleAddress = OFFCHAIN_ORACLE_ADDRESSES.get(network);

  if (oracleAddress === null) {
    log.warning('No offchain oracle address for network {}', [network]);

    return null;
  }

  const offchainOracle = OffchainOracle.bind(
    Address.fromBytes(Address.fromHexString(oracleAddress))
  );

  const rate = offchainOracle.try_getRateToEth(tokenAddress, true);

  if (rate.reverted) {
    log.warning('Failed to get rate to ETH for token {}', [tokenAddress.toHexString()]);

    return null;
  }

  const tokenInfo = TokenInfo.fromAddress(tokenAddress);

  const tokenDecimals = tokenInfo.decimals as u8;

  return rate.value.toBigDecimal().div(new BigDecimal(BIGINT_TEN.pow(18 + 18 - tokenDecimals)));

  // return null;
}

export function getRateToUsd(tokenAddress: Address): BigDecimal | null {
  const network = dataSource.network();

  const rateToEth = getRateToEth(tokenAddress);

  if (rateToEth === null) {
    log.warning('Failed to get rate to ETH for token {}', [tokenAddress.toHexString()]);
    return null;
  }

  const daiAddress = DAI_ADDRESSES.get(network);

  if (daiAddress === null) {
    log.warning('No DAI address for network {}', [network]);

    return null;
  }

  const rateToDai = getRateToEth(Address.fromBytes(Address.fromHexString(daiAddress)));

  if (rateToDai === null) {
    log.warning('Failed to get rate to DAI for token {}', [tokenAddress.toHexString()]);

    return null;
  }

  return rateToEth.div(rateToDai);
}

export function convertToUsd(tokenAddress: Address, amount: BigInt): BigDecimal | null {
  const rateToUsd = getRateToUsd(tokenAddress);

  if (!rateToUsd) {
    return null;
  }

  const tokenInfo = TokenInfo.fromAddress(tokenAddress);

  const tokenDecimals = tokenInfo.decimals as u8;

  const amountDecimal = amountToDecimal(amount, tokenDecimals);

  return amountDecimal.times(rateToUsd).truncate(2);
}
