import { useEffect } from 'react';
import type { Quote } from '@sifi/sdk';
import { parseUnits } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { useSifi } from 'src/providers/SDKProvider';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { useSelectedChain } from 'src/providers/SelectedChainProvider';
import { formatTokenAmount, getQueryKey, getTokenBySymbol, isValidTokenAmount } from 'src/utils';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useTokens } from './useTokens';

const useQuote = () => {
  const sifi = useSifi();
  const [fromTokenSymbol, toTokenSymbol, fromAmount] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
  const { setValue } = useFormContext();
  const { tokens } = useTokens();
  const { selectedChain } = useSelectedChain();
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const toToken = getTokenBySymbol(toTokenSymbol, tokens);
  const isSameTokenPair = fromToken?.address === toToken?.address;

  const quoteRequest = {
    fromToken: fromToken?.address || ETH_CONTRACT_ADDRESS,
    toToken: toToken?.address || ETH_CONTRACT_ADDRESS,
    fromAmount: parseUnits(
      fromAmount?.endsWith('.') ? `${fromAmount}0` : fromAmount || '0',
      fromToken?.decimals || 0
    ).toString(),
    fromChain: selectedChain.id,
    toChain: selectedChain.id,
  };

  const handleSuccesfulQuoteFetch = (quote: Quote): void => {
    setValue(SwapFormKey.ToAmount, formatTokenAmount(quote.toAmount.toString(), toToken?.decimals));
  };

  const enabled =
    Boolean(fromToken) &&
    Boolean(toToken) &&
    Boolean(fromAmount) &&
    !isSameTokenPair &&
    isValidTokenAmount(fromAmount);
  const queryKey = getQueryKey('quote', fromAmount, toToken?.address, fromToken?.address);

  // TODO: Quote gets fetched 4 times
  const {
    data: quote,
    error,
    ...rest
  } = useQuery(queryKey, async () => sifi.getQuote(quoteRequest), {
    enabled,
    onSuccess: handleSuccesfulQuoteFetch,
    staleTime: 60_000,
  });

  // To avoid showing the last qoute when the user clears fromAmount
  useEffect(() => {
    if (!fromAmount) {
      setValue(SwapFormKey.ToAmount, '');
    }
  }, [fromAmount]);

  return {
    quote,
    ...rest,
  };
};

export { useQuote };
