import { Address, log } from '@graphprotocol/graph-ts';
import { Withdraw as WithdrawEvent } from '../../generated/SifiDiamond/SifiDiamond';
import { Partner, PartnerToken, Withdrawal } from '../../generated/schema';
import { BIGINT_ZERO } from '../constants';
import { amountToDecimal, getEventId, isZeroAddress } from '../helpers';
import { getPartnerTokenId } from '../services/partnerToken';
import { convertToUsdWithRate, memGetRateToUsd } from '../services/pricing';
import { getOrCreateToken } from '../services/tokens';

export function handleWithdrawEvent(event: WithdrawEvent): void {
  const amount = event.params.amount;

  if (amount.equals(BIGINT_ZERO)) {
    return;
  }

  // HACK: Do not track withdrawals for the protocol since it may
  // withdraw funds to recover them, resulting in negative balances
  const tokenAddress = event.params.token;
  const partnerAddress = event.params.partner;

  if (isZeroAddress(partnerAddress)) {
    return;
  }

  const rateUsd = memGetRateToUsd.get(tokenAddress);
  const token = getOrCreateToken(tokenAddress);

  const tokenDecimals = token.decimals.toI32();
  const amountDecimal = amountToDecimal(amount, tokenDecimals);
  const amountUsd = rateUsd ? convertToUsdWithRate(rateUsd, amountDecimal) : null;

  const partnerId = partnerAddress.toHexString();

  const partner = Partner.load(partnerId)!;
  assert(partner !== null, 'Partner should exist');

  if (amountUsd !== null) {
    partner.modifiedAt = event.block.timestamp;
    partner.modifiedAtBlock = event.block.number;
    partner.modifiedAtTransaction = event.transaction.hash;

    partner.withdrawnUsd = partner.withdrawnUsd.plus(amountUsd);

    partner.save();
  }

  const partnerTokenId = getPartnerTokenId(partnerAddress, Address.fromBytes(token.address));

  const partnerToken = PartnerToken.load(partnerTokenId)!;
  assert(partnerToken !== null, 'PartnerToken should exist');

  partnerToken.modifiedAt = event.block.timestamp;
  partnerToken.modifiedAtBlock = event.block.number;
  partnerToken.modifiedAtTransaction = event.transaction.hash;

  const nextBalance = partnerToken.balance.minus(amount);
  const nextBalanceDecimal = amountToDecimal(nextBalance, tokenDecimals);

  partnerToken.balance = nextBalance;
  partnerToken.balanceDecimal = nextBalanceDecimal;
  partnerToken.balanceUsd = rateUsd ? convertToUsdWithRate(rateUsd, nextBalanceDecimal) : null;

  const nextWithdrawn = partnerToken.withdrawn.plus(amount);
  const nextWithdrawnDecimal = amountToDecimal(nextWithdrawn, tokenDecimals);

  partnerToken.withdrawn = nextWithdrawn;
  partnerToken.withdrawnDecimal = nextWithdrawnDecimal;
  partnerToken.withdrawnUsd = rateUsd ? convertToUsdWithRate(rateUsd, nextWithdrawnDecimal) : null;

  partnerToken.save();

  const withdrawal = new Withdrawal(getEventId(event));

  withdrawal.addedAt = event.block.timestamp;
  withdrawal.addedAtBlock = event.block.number;
  withdrawal.addedAtTransaction = event.transaction.hash;

  withdrawal.partnerToken = partnerToken.id;
  withdrawal.partner = partner.id;
  withdrawal.token = token.id;

  withdrawal.amount = amount;
  withdrawal.amountDecimal = amountDecimal;
  withdrawal.amountUsd = amountUsd;

  withdrawal.save();
}
