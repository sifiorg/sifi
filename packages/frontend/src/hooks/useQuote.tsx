import { useEffect } from 'react';
import type { Quote } from '@sifi/sdk';
import { showToast } from '@sifi/shared-ui';
import { parseUnits } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useSifi } from 'src/providers/SDKProvider';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import {
  formatTokenAmount,
  getQueryKey,
  getTokenBySymbol,
  isValidTokenAmount,
  parseSifiErrorMessage,
} from 'src/utils';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useTokens } from './useTokens';
import { useSwapFormValues } from './useSwapFormValues';

type UseQuoteReturnType = {
  quote?: Quote;
  isLoading: boolean;
  isFetching: boolean;
};

const useQuote = (): UseQuoteReturnType => {
  const sifi = useSifi();
  const {
    fromToken: fromTokenSymbol,
    toToken: toTokenSymbol,
    fromAmount,
    fromChain,
    toChain,
  } = useSwapFormValues();
  const { setValue } = useFormContext();
  const { fromTokens, toTokens } = useTokens();
  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);
  const toToken = getTokenBySymbol(toTokenSymbol, toTokens);
  const isSameTokenPair = fromToken?.address === toToken?.address && fromChain?.id === toChain?.id;

  const quoteRequest = {
    fromToken: fromToken?.address || ETH_CONTRACT_ADDRESS,
    toToken: toToken?.address || ETH_CONTRACT_ADDRESS,
    fromAmount: parseUnits(
      fromAmount?.endsWith('.') ? `${fromAmount}0` : fromAmount || '0',
      fromToken?.decimals || 0
    ).toString(),
    fromChain: fromChain.id,
    toChain: toChain.id,
  };

  const handleSuccesfulQuoteFetch = (quote: Quote): void => {
    setValue(SwapFormKey.ToAmount, formatTokenAmount(quote.toAmount.toString(), toToken?.decimals));
  };

  const handleQuoteFetchError = (error: unknown): void => {
    if (error instanceof Error) {
      showToast({
        text: parseSifiErrorMessage(error.message, { fromToken, toToken }),
        type: 'error',
        toastId: `quote-error-${fromToken?.symbol}-${fromChain.id}-${toToken?.symbol}-${toChain.id}`,
      });
    }
    setValue(SwapFormKey.ToAmount, '');
  };

  const enabled =
    Boolean(fromToken) &&
    Boolean(toToken) &&
    Boolean(fromAmount) &&
    !isSameTokenPair &&
    isValidTokenAmount(fromAmount);
  const queryKey = getQueryKey('quote', fromAmount, fromToken, toToken);

  // TODO: Quote gets fetched 4 times
  const {
    data: quote,
    error,
    isSuccess,
    isError,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: async () => sifi.getQuote(quoteRequest),
    enabled,
    staleTime: 60_000,
    retry: failureCount => failureCount < 1, // Retry once on failure
  });

  // Callbacks were removed with react-query v5
  // https://github.com/TanStack/query/discussions/5279
  useEffect(() => {
    if (isSuccess && quote) {
      handleSuccesfulQuoteFetch(quote);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError && error) {
      handleQuoteFetchError(error);
    }
  }, [isError]);

  useEffect(() => {
    if (!enabled) {
      setValue(SwapFormKey.ToAmount, '');
    }
  }, [enabled]);

  return {
    quote,
    isLoading,
    isFetching,
  };
};

export { useQuote };
