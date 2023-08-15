import { RoutesRequest, RoutesResponse } from '@lifi/sdk';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useFormContext, useWatch } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { useLiFi } from '../providers/SDKProvider';
import { SwapFormKey } from '../providers/SwapFormProvider';
import { useTokens } from './useTokens';
import { useQuote } from './useQuote';
import { useAllowance } from './useAllowance';
import { getTokenBySymbol, formatTokenAmount, getQueryKey } from '../utils';
import { ETH_CONTRACT_ADDRESS } from '../constants';

const useSwapRoutes = () => {
  const { address } = useAccount();
  const LiFi = useLiFi();
  const [fromTokenSymbol, toTokenSymbol, fromAmount] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
  const { setValue } = useFormContext();
  const { tokens } = useTokens();
  const { quote } = useQuote();
  const { isAllowanceAboveMinumum } = useAllowance();
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const toToken = getTokenBySymbol(toTokenSymbol, tokens);
  const isFromEthereum = fromToken?.address === ETH_CONTRACT_ADDRESS;

  const routesRequest: RoutesRequest = {
    fromChainId: 1,
    fromAmount: ethers.utils
      .parseUnits(
        fromAmount?.endsWith('.') ? `${fromAmount}0` : fromAmount || '0',
        fromToken?.decimals || 0
      )
      .toString(),
    fromTokenAddress: fromToken?.address || '', // TODO: FIX this
    fromAddress: address || ETH_CONTRACT_ADDRESS,
    toChainId: 1,
    toTokenAddress: toToken?.address || '', // TODO: FIX this,
    toAddress: address || ETH_CONTRACT_ADDRESS,
    options: { order: 'RECOMMENDED' },
  };

  const handleRoutesFetchError = () => {
    setValue(SwapFormKey.ToAmount, 0);
  };

  const handleRoutesFetchSuccess = (data: RoutesResponse) => {
    if (data.routes.length === 0) {
      handleRoutesFetchError();

      return;
    }

    setValue(
      SwapFormKey.ToAmount,
      formatTokenAmount(data.routes[0].toAmount, data.routes[0].toToken.decimals)
    );
  };

  const queryKey = getQueryKey('routes', fromAmount, toToken?.address, fromToken?.address);
  const enabled =
    !!fromToken &&
    !!toToken &&
    !!fromAmount &&
    (isFromEthereum || (!!quote && !!isAllowanceAboveMinumum && !!address));

  const { data, ...rest } = useQuery(queryKey, async () => LiFi.getRoutes(routesRequest), {
    enabled,
    staleTime: 60_000,
    onSuccess: handleRoutesFetchSuccess,
    onError: handleRoutesFetchError,
  });

  return {
    routes: data?.routes,
    recommendedRoute: data?.routes[0],
    ...rest,
  };
};

export { useSwapRoutes };
