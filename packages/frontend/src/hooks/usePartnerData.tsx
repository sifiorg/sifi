import { PartnerTokensByChain, usePartnerTokens } from './usePartnerTokens';

const calculateTotalBalanceUsd = (partnerTokensByChain: PartnerTokensByChain) => {
  return partnerTokensByChain
    ? Object.values(partnerTokensByChain).reduce((total, data) => {
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

const calculateLifetimeEarningsUsd = (partnerTokensByChain: PartnerTokensByChain) => {
  return partnerTokensByChain
    ? Object.values(partnerTokensByChain).reduce((total, data) => {
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
  const { data: partnerTokensByChain, isLoading } = usePartnerTokens(address || '');
  const totalBalanceUsd = partnerTokensByChain ? calculateTotalBalanceUsd(partnerTokensByChain) : 0;
  const lifetimeEarningsUsd = partnerTokensByChain
    ? calculateLifetimeEarningsUsd(partnerTokensByChain)
    : 0;

  return { partnerTokensByChain, totalBalanceUsd, lifetimeEarningsUsd, isLoading };
};

export { usePartnerData };
