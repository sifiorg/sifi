import { Warp as WarpEvent } from '../../generated/SifiDiamond/SifiDiamond';
import { Warp } from '../../generated/schema';
import { BIGINT_ONE } from '../constants';
import { amountToDecimal, getEventId, isZeroAddress } from '../helpers';
import { convertToUsd } from '../services/pricing';
import { getOrCreateAllTimeStats } from '../services/stats/all-time';
import { TokenInfo, getOrCreateToken } from '../services/tokens';

export function handleWarpEvent(event: WarpEvent): void {
  const warp = new Warp(getEventId(event));

  const tokenInAddress = event.params.tokenIn;
  const tokenOutAddress = event.params.tokenOut;
  const amountIn = event.params.amountIn;
  const amountOut = event.params.amountOut;

  const amountInUsd = convertToUsd(tokenInAddress, amountIn);
  const amountOutUsd = convertToUsd(tokenInAddress, amountOut);

  const tokenIn = getOrCreateToken(tokenInAddress);
  const tokenOut = getOrCreateToken(tokenOutAddress);

  warp.tokenIn = tokenIn.address.toHexString();
  warp.tokenOut = tokenOut.address.toHexString();
  warp.amountIn = amountIn;
  warp.amountInDecimal = amountToDecimal(amountIn, tokenIn.decimals.toI32());
  warp.amountInUsd = amountInUsd;
  warp.amountOut = amountOut;
  warp.amountOutDecimal = amountToDecimal(amountOut, tokenOut.decimals.toI32());
  warp.amountOutUsd = amountOutUsd;

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
