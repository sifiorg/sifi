import { PartnerTokens, usePartnerTokens } from './usePartnerTokens';

const calculateTotalBalanceUsd = (partnerTokens: PartnerTokens) => {
  return partnerTokens
    ? Object.values(partnerTokens).reduce((total, data) => {
        if (data?.partner?.tokens) {
          const totalForChain = data.partner.tokens.reduce(
            (total, token) => total + parseFloat(token.balanceUsd),
            0
          );
          return total + totalForChain;
        }
        return parseFloat(total.toFixed(2));
      }, 0)
    : 0;
};

const calculateLifetimeEarningsUsd = (partnerTokens: PartnerTokens) => {
  return partnerTokens
    ? Object.values(partnerTokens).reduce((total, data) => {
        if (data?.partner?.tokens) {
          const totalForChain = data.partner.tokens.reduce(
            (total, token) => total + parseFloat(token.balanceUsd) + parseFloat(token.withdrawnUsd),
            0
          );
          return total + totalForChain;
        }
        return parseFloat(total.toFixed(2));
      }, 0)
    : 0;
};

const usePartnerData = (address: string) => {
  const { data: partnerTokens, isLoading } = usePartnerTokens(address || '');
  const totalBalanceUsd = partnerTokens ? calculateTotalBalanceUsd(partnerTokens) : 0;
  const lifetimeEarningsUsd = partnerTokens ? calculateLifetimeEarningsUsd(partnerTokens) : 0;

  return { partnerTokens, totalBalanceUsd, lifetimeEarningsUsd, isLoading };
};

export { usePartnerData };
