import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getQueryKey, getTokenBySymbol } from 'src/utils';
import { useTokens } from './useTokens';
import { useSwapFormValues } from './useSwapFormValues';

const useCullQueries = (primaryKey: string) => {
  const queryClient = useQueryClient();
  const { fromToken: fromTokenSymbol, fromToken: toTokenSymbol, fromAmount } = useSwapFormValues();
  const { tokens } = useTokens();

  useEffect(() => {
    const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
    const toToken = getTokenBySymbol(toTokenSymbol, tokens);

    queryClient
      .invalidateQueries({
        predicate: query =>
          query.queryKey !==
          getQueryKey(primaryKey, fromAmount, fromToken?.address, toToken?.address),
      })
      .catch(error => console.log(error.message));
  }, [fromAmount, fromTokenSymbol, toTokenSymbol]);
};

export { useCullQueries };
