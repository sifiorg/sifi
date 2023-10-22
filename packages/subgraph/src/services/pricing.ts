import { Address, BigDecimal, dataSource, log } from '@graphprotocol/graph-ts';
import { OffchainOracle } from '../../generated/SifiDiamond/OffchainOracle';
import { BIGDECIMAL_ONE, BIGINT_TEN } from '../constants';
import { Memoizer, isZeroAddress } from '../helpers';
import { PRICE_ORACLES, USD_ADDRESSES } from '../networks';
import { memTokenInfoFromAddress } from './tokens';

function getRateToEth(tokenAddress: Address): BigDecimal | null {
  if (isZeroAddress(tokenAddress)) {
    return BIGDECIMAL_ONE;
  }

  const network = dataSource.network();

  const oracleAddress = PRICE_ORACLES.get(network);

  if (oracleAddress === null) {
    log.warning('No offchain oracle address for network {}', [network]);

    return null;
  }

  const offchainOracle = OffchainOracle.bind(oracleAddress);

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

  const usdAddress = USD_ADDRESSES.get(network);

  if (usdAddress === null) {
    log.warning('No USD address for network {}', [network]);

    return null;
  }

  if (tokenAddress.equals(usdAddress)) {
    return BIGDECIMAL_ONE;
  }

  const rateToUsd = memGetRateToEth.get(usdAddress);

  if (rateToUsd === null) {
    log.warning('Failed to get rate to USD for token {}', [tokenAddress.toHexString()]);

    return null;
  }

  const rateToEth = memGetRateToEth.get(tokenAddress);

  if (rateToEth === null) {
    log.warning('Failed to get rate to ETH for token {}', [tokenAddress.toHexString()]);

    return null;
  }

  return rateToEth.div(rateToUsd);
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
