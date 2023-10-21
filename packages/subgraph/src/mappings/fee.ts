import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Fee as FeeEvent } from '../../generated/SifiDiamond/SifiDiamond';
import { Fee, Partner, PartnerToken, Token } from '../../generated/schema';
import { BIGDECIMAL_ZERO, BIGINT_ZERO, ZERO_ADDRESS } from '../constants';
import { amountToDecimal, getEventId, isZeroAddress } from '../helpers';
import { getPartnerTokenId } from '../services/partnerToken';
import { convertToUsdWithRate, memGetRateToUsd } from '../services/pricing';
import { getOrCreateToken } from '../services/tokens';
import { getOrCreateAllTimeStats } from '../services/stats/all-time';

function addFeeTo(
  event: FeeEvent,
  partnerAddress: Address,
  token: Token,
  amount: BigInt,
  rateUsd: BigDecimal | null
): void {
  const tokenDecimals = token.decimals.toI32();
  const amountDecimal = amountToDecimal(amount, tokenDecimals);
  const amountUsd = rateUsd ? convertToUsdWithRate(rateUsd, amountDecimal) : null;

  const partnerId = partnerAddress.toHexString();

  let partner = Partner.load(partnerId);

  if (partner === null) {
    partner = new Partner(partnerId);

    partner.addedAt = event.block.timestamp;
    partner.addedAtBlock = event.block.number;
    partner.addedAtTransaction = event.transaction.hash;
    partner.rewardedUsd = BIGDECIMAL_ZERO;
    partner.withdrawnUsd = BIGDECIMAL_ZERO;

    partner.modifiedAt = event.block.timestamp;
    partner.modifiedAtBlock = event.block.number;
    partner.modifiedAtTransaction = event.transaction.hash;

    partner.save();
  }

  if (amountUsd !== null) {
    partner.modifiedAt = event.block.timestamp;
    partner.modifiedAtBlock = event.block.number;
    partner.modifiedAtTransaction = event.transaction.hash;

    partner.rewardedUsd = partner.rewardedUsd.plus(amountUsd);

    partner.save();
  }

  const partnerTokenId = getPartnerTokenId(partnerAddress, Address.fromBytes(token.address));

  let partnerToken = PartnerToken.load(partnerTokenId);

  if (partnerToken === null) {
    partnerToken = new PartnerToken(partnerTokenId);
    partnerToken.addedAt = event.block.timestamp;
    partnerToken.addedAtBlock = event.block.number;
    partnerToken.addedAtTransaction = event.transaction.hash;

    partnerToken.token = token.id;
    partnerToken.partner = partner.id;

    partnerToken.balance = BIGINT_ZERO;
    partnerToken.balanceDecimal = BIGDECIMAL_ZERO;
    partnerToken.balanceUsd = BIGDECIMAL_ZERO;

    partnerToken.rewarded = BIGINT_ZERO;
    partnerToken.rewardedDecimal = BIGDECIMAL_ZERO;
    partnerToken.rewardedUsd = BIGDECIMAL_ZERO;

    partnerToken.withdrawn = BIGINT_ZERO;
    partnerToken.withdrawnDecimal = BIGDECIMAL_ZERO;
    partnerToken.withdrawnUsd = BIGDECIMAL_ZERO;
  }

  partnerToken.modifiedAt = event.block.timestamp;
  partnerToken.modifiedAtBlock = event.block.number;
  partnerToken.modifiedAtTransaction = event.transaction.hash;

  const nextBalance = partnerToken.balance.plus(amount);
  const nextBalanceDecimal = amountToDecimal(nextBalance, tokenDecimals);

  partnerToken.balance = nextBalance;
  partnerToken.balanceDecimal = nextBalanceDecimal;
  partnerToken.balanceUsd = rateUsd ? convertToUsdWithRate(rateUsd, nextBalanceDecimal) : null;

  const nextRewarded = partnerToken.rewarded.plus(amount);
  const nextRewardedDecimal = amountToDecimal(nextRewarded, tokenDecimals);

  partnerToken.rewarded = nextRewarded;
  partnerToken.rewardedDecimal = nextRewardedDecimal;
  partnerToken.rewardedUsd = rateUsd ? convertToUsdWithRate(rateUsd, nextRewardedDecimal) : null;

  partnerToken.save();

  let feeId = getEventId(event);

  if (isZeroAddress(partnerAddress)) {
    feeId = feeId + '-protocol';
  } else {
    feeId = feeId + '-partner';
  }

  const fee = new Fee(feeId);

  fee.addedAt = event.block.timestamp;
  fee.addedAtBlock = event.block.number;
  fee.addedAtTransaction = event.transaction.hash;

  fee.partnerToken = partnerToken.id;
  fee.partner = partner.id;
  fee.token = token.id;

  fee.amount = amount;
  fee.amountDecimal = amountDecimal;
  fee.amountUsd = amountUsd;

  fee.save();
}

export function handleFeeEvent(event: FeeEvent): void {
  const amountProtocol = event.params.protocolFee;
  const rateUsd = memGetRateToUsd.get(event.params.token);
  const token = getOrCreateToken(event.params.token);

  if (amountProtocol.gt(BIGINT_ZERO)) {
    addFeeTo(event, ZERO_ADDRESS, token, amountProtocol, rateUsd);
  }

  const amountPartner = event.params.partnerFee;

  if (amountPartner.gt(BIGINT_ZERO)) {
    addFeeTo(event, event.params.partner, token, amountPartner, rateUsd);
  }

  if (rateUsd !== null) {
    const allTimeStats = getOrCreateAllTimeStats(event);

    allTimeStats.modifiedAt = event.block.timestamp;
    allTimeStats.modifiedAtBlock = event.block.number;
    allTimeStats.modifiedAtTransaction = event.transaction.hash;

    const tokenDecimals = token.decimals.toI32();

    if (amountPartner.gt(BIGINT_ZERO)) {
      const amountPartnerDecimal = amountToDecimal(amountPartner, tokenDecimals);
      const amountPartnerUsd = convertToUsdWithRate(rateUsd, amountPartnerDecimal);

      allTimeStats.partnerFeesUsd = allTimeStats.partnerFeesUsd.plus(amountPartnerUsd);
    }

    if (amountProtocol.gt(BIGINT_ZERO)) {
      const amountProtocolDecimal = amountToDecimal(amountProtocol, tokenDecimals);
      const amountProtocolUsd = convertToUsdWithRate(rateUsd, amountProtocolDecimal);

      allTimeStats.protocolFeesUsd = allTimeStats.protocolFeesUsd.plus(amountProtocolUsd);
    }

    allTimeStats.save();
  }
}
