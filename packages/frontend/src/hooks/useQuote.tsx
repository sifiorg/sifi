import { useEffect } from 'react';
import { QuoteRequest, Step } from '@lifi/sdk';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useLiFi } from '../providers/SDKProvider';
import { SwapFormKey } from '../providers/SwapFormProvider';
import { useTokens } from './useTokens';
import { formatTokenAmount, getQueryKey, getTokenBySymbol } from '../utils';
import { ETH_CONTRACT_ADDRESS } from '../constants';

const useQuote = () => {
  const LiFi = useLiFi();
  const { address } = useAccount();
  const [fromTokenSymbol, toTokenSymbol, fromAmount] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
  const { setValue } = useFormContext();
  const { tokens } = useTokens();
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const toToken = getTokenBySymbol(toTokenSymbol, tokens);
  const isFromEthereum = fromToken?.address === ETH_CONTRACT_ADDRESS;

  const quoteRequest: QuoteRequest = {
    fromChain: 1,
    fromToken: fromToken?.address || ethers.constants.AddressZero,
    toToken: toToken?.address || ethers.constants.AddressZero,
    fromAmount: ethers.utils
      .parseUnits(
        fromAmount?.endsWith('.') ? `${fromAmount}0` : fromAmount || '0',
        fromToken?.decimals || 0
      )
      .toString(),
    fromAddress: address || ethers.constants.AddressZero,
    toChain: 1,
    toAddress: address || ethers.constants.AddressZero,
  };

  const handleSuccesfulQuoteFetch = (quote: Step): void => {
    setValue(
      SwapFormKey.ToAmount,
      formatTokenAmount(quote.estimate.toAmount, quote.action.toToken.decimals)
    );
  };

  const enabled = !!fromToken && !!toToken && !!fromAmount && !isFromEthereum;
  const queryKey = getQueryKey('quote', fromAmount, toToken?.address, fromToken?.address);

  const { data: quote, ...rest } = useQuery(queryKey, async () => LiFi.getQuote(quoteRequest), {
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
