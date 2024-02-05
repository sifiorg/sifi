import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { useSwapFormValues } from './useSwapFormValues';
import { useTokens } from './useTokens';
import { getTokenBySymbol } from 'src/utils';
import { useWalletBalances } from './useWalletBalances';

const useRefetchBalances = () => {
  const {
    fromToken: fromTokenSymbol,
    toToken: toTokenSymbol,
    fromChain,
    toChain,
  } = useSwapFormValues();
  const { fromTokens, toTokens } = useTokens();
  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);
  const toToken = getTokenBySymbol(toTokenSymbol, toTokens);
  const { refetch: refetchFromBalance } = useTokenBalance(fromToken, fromChain.id);
  const { refetch: refetchToBalance } = useTokenBalance(toToken, toChain.id);
  const { refetchBalances } = useWalletBalances();

  const refetchAllBalances = () => {
    refetchFromBalance();
    refetchToBalance();
    refetchBalances();
  };

  return {
    refetchAllBalances,
    refetchFromBalance,
    refetchToBalance,
    refetchBalances,
  };
};

export { useRefetchBalances };
