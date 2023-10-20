import { ethereum } from '@graphprotocol/graph-ts';
import { AllTimeStats } from '../../../generated/schema';
import { BIGDECIMAL_ZERO, BIGINT_ZERO, CURRENT } from '../../constants';

export function getOrCreateAllTimeStats(event: ethereum.Event): AllTimeStats {
  let state = AllTimeStats.load(CURRENT);

  if (state === null) {
    state = new AllTimeStats(CURRENT);
    state.modifiedAt = event.block.timestamp;
    state.modifiedAtBlock = event.block.number;
    state.modifiedAtTransaction = event.transaction.hash;
    state.warpCount = BIGINT_ZERO;
    state.volumeUsd = BIGDECIMAL_ZERO;
  }

  return state;
}
