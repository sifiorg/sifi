import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { ethers } from 'ethers';
import { useSifi } from '../providers/SDKProvider';
import { SwapFormKey } from '../providers/SwapFormProvider';
import { useTokens } from './useTokens';
import { formatTokenAmount, getQueryKey, getTokenBySymbol, parseErrorMessage } from '../utils';
import { ETH_CONTRACT_ADDRESS } from '../constants';
import type { Quote } from '@sifi/sdk';

const useQuote = () => {
  const sifi = useSifi();
  const [fromTokenSymbol, toTokenSymbol, fromAmount] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
  const { setValue } = useFormContext();
  const { tokens } = useTokens();
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const toToken = getTokenBySymbol(toTokenSymbol, tokens);
  const isFromEthereum = fromToken?.address === ETH_CONTRACT_ADDRESS;

  const quoteRequest = {
    fromToken: fromToken?.address || ETH_CONTRACT_ADDRESS,
    toToken: toToken?.address || ETH_CONTRACT_ADDRESS,
    fromAmount: ethers.utils
      .parseUnits(
        fromAmount?.endsWith('.') ? `${fromAmount}0` : fromAmount || '0',
        fromToken?.decimals || 0
      )
      .toString(),
  };

  const handleSuccesfulQuoteFetch = (quote: Quote): void => {
    setValue(SwapFormKey.ToAmount, formatTokenAmount(quote.toAmount.toString(), toToken?.decimals));
  };

  const enabled = !!fromToken && !!toToken && !!fromAmount;
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
