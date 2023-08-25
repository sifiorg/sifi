import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { getQueryKey, getTokenBySymbol } from 'src/utils';
import { useTokens } from './useTokens';

const useCullQueries = (primaryKey: string) => {
  const queryClient = useQueryClient();
  const [fromTokenSymbol, toTokenSymbol, fromAmount] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
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
