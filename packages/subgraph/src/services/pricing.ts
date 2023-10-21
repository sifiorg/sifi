import { log } from '@graphprotocol/graph-ts';
import { Address, BigDecimal, TypedMap, dataSource } from '@graphprotocol/graph-ts';
import { memTokenInfoFromAddress } from './tokens';
import { OffchainOracle } from '../../generated/SifiDiamond/OffchainOracle';
import { BIGDECIMAL_ONE, BIGINT_TEN } from '../constants';
import { Memoizer, isZeroAddress } from '../helpers';

const OFFCHAIN_ORACLE_ADDRESSES = new TypedMap<string, string>();
OFFCHAIN_ORACLE_ADDRESSES.set('mainnet', '0x3e1fe1bd5a5560972bfa2d393b9ac18af279ff56');
OFFCHAIN_ORACLE_ADDRESSES.set('arbitrum-one', '0x59bc892e1832ae86c268fc21a91fe940830a52b0');

const DAI_ADDRESSES = new TypedMap<string, string>();
DAI_ADDRESSES.set('mainnet', '0x6b175474e89094c44da98b954eedeac495271d0f');
DAI_ADDRESSES.set('arbitrum-one', '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1');

function getRateToEth(tokenAddress: Address): BigDecimal | null {
  if (isZeroAddress(tokenAddress)) {
    return BIGDECIMAL_ONE;
  }

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

  const tokenInfo = memTokenInfoFromAddress.get(tokenAddress);

  const tokenDecimals = tokenInfo.decimals as u8;

  return rate.value.toBigDecimal().div(new BigDecimal(BIGINT_TEN.pow(18 + 18 - tokenDecimals)));
}

const memGetRateToEth = new Memoizer<Address, BigDecimal | null>(getRateToEth);

function getRateToUsd(tokenAddress: Address): BigDecimal | null {
  const network = dataSource.network();

  const daiAddress = DAI_ADDRESSES.get(network);

  if (daiAddress === null) {
    log.warning('No DAI address for network {}', [network]);

    return null;
  }

  if (tokenAddress.toHexString() === daiAddress) {
    return BIGDECIMAL_ONE;
  }

  const rateToDai = memGetRateToEth.get(Address.fromBytes(Address.fromHexString(daiAddress)));

  if (rateToDai === null) {
    log.warning('Failed to get rate to DAI for token {}', [tokenAddress.toHexString()]);

    return null;
  }

  const rateToEth = memGetRateToEth.get(tokenAddress);

  if (rateToEth === null) {
    log.warning('Failed to get rate to ETH for token {}', [tokenAddress.toHexString()]);

    return null;
  }

  return rateToEth.div(rateToDai);
}

export const memGetRateToUsd = new Memoizer<Address, BigDecimal | null>(getRateToUsd);

export function convertToUsdWithRate(rateUsd: BigDecimal, amountDecimal: BigDecimal): BigDecimal {
  // Fees can be really small
  return amountDecimal.times(rateUsd).truncate(5);
}

export function convertToUsd(tokenAddress: Address, amountDecimal: BigDecimal): BigDecimal | null {
  const rateToUsd = memGetRateToUsd.get(tokenAddress);

  if (rateToUsd === null) {
    return null;
  }

  return convertToUsdWithRate(rateToUsd, amountDecimal);
}
