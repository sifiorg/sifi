import { dataSource } from '@graphprotocol/graph-ts';
import { Warp as WarpEvent } from '../../generated/SifiDiamond/SifiDiamond';
import { Warp } from '../../generated/schema';
import { BIGINT_ONE } from '../constants';
import { amountToDecimal, getEventId } from '../helpers';
import { convertToUsdWithRate, memGetRateToUsd } from '../services/pricing';
import { getOrCreateAllTimeStats } from '../services/stats/all-time';
import { getOrCreateToken } from '../services/tokens';

export function handleWarpEvent(event: WarpEvent): void {
  const warp = new Warp(getEventId(event));

  const tokenInAddress = event.params.tokenIn;
  const tokenOutAddress = event.params.tokenOut;
  const amountIn = event.params.amountIn;
  const amountOut = event.params.amountOut;

  const tokenIn = getOrCreateToken(tokenInAddress);
  const tokenOut = getOrCreateToken(tokenOutAddress);

  const amountInDecimal = amountToDecimal(amountIn, tokenIn.decimals.toI32());
  const amountOutDecimal = amountToDecimal(amountOut, tokenOut.decimals.toI32());

  const tokenInRateUsd = memGetRateToUsd.get(tokenInAddress);
  const tokenOutRateUsd = memGetRateToUsd.get(tokenOutAddress);

  const amountInUsd = tokenInRateUsd ? convertToUsdWithRate(tokenInRateUsd, amountInDecimal) : null;
  const amountOutUsd = tokenOutRateUsd
    ? convertToUsdWithRate(tokenOutRateUsd, amountOutDecimal)
    : null;

  warp.tokenIn = tokenIn.address.toHexString();
  warp.tokenOut = tokenOut.address.toHexString();
  warp.amountIn = amountIn;
  warp.amountInDecimal = amountInDecimal;
  warp.amountInUsd = amountInUsd;
  warp.amountOut = amountOut;
  warp.amountOutDecimal = amountOutDecimal;
  warp.amountOutUsd = amountOutUsd;

  warp.from = event.transaction.from;
  warp.addedAt = event.block.timestamp;
  warp.addedAtBlock = event.block.number;
  warp.addedAtTransaction = event.transaction.hash;

  warp.save();

  const allTimeStats = getOrCreateAllTimeStats(event);

  allTimeStats.modifiedAt = event.block.timestamp;
  allTimeStats.modifiedAtBlock = event.block.number;
  allTimeStats.modifiedAtTransaction = event.transaction.hash;
  allTimeStats.warpCount = allTimeStats.warpCount.plus(BIGINT_ONE);

  if (amountInUsd) {
    allTimeStats.volumeUsd = allTimeStats.volumeUsd.plus(amountInUsd);
  }

  allTimeStats.save();
}
