import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { useMultiCallTokenBalance } from 'src/hooks/useMulticallTokenBalance';
import { useSwapFormValues } from './useSwapFormValues';
import { useTokens } from './useTokens';
import { getTokenBySymbol } from 'src/utils';
import { MulticallToken } from 'src/types';

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
  const { refetch: refetchFromTokenBalances } = useMultiCallTokenBalance(
    fromTokens as MulticallToken[],
    fromChain.id
  );
  const { refetch: refetchToTokenBalances } = useMultiCallTokenBalance(
    toTokens as MulticallToken[],
    toChain.id
  );

  const refetchAllBalances = () => {
    refetchFromBalance();
    refetchToBalance();
    refetchFromTokenBalances();
    refetchToTokenBalances();
  };

  return {
    refetchAllBalances,
    refetchFromBalance,
    refetchToBalance,
    refetchFromTokenBalances,
    refetchToTokenBalances,
  };
};

export { useRefetchBalances };
