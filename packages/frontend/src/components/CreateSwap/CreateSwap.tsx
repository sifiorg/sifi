import { useEffect, useState } from 'react';
import { useWatch, useForm, useFormContext } from 'react-hook-form';
import { useAccount, useSigner } from 'wagmi';
import { showToast, ShiftInput } from '@sifi/shared-ui';
import { useTokens } from '../../hooks/useTokens';
import { useLiFi } from '../../providers/SDKProvider';
import { getTokenBySymbol, parseErrorMessage } from '../../utils';
import { SwapFormKey, SwapFormKeyHelper } from '../../providers/SwapFormProvider';
import { useSwapRoutes } from '../../hooks/useSwapRoutes';
import { useCullQueries } from '../../hooks/useCullQueries';
import { CreateSwapButtons } from '../CreateSwapButtons/CreateSwapButtons';
import { useQuote } from '../../hooks/useQuote';
import { ETH_CONTRACT_ADDRESS } from '../../constants';
import { TokenSelector, useTokenSelector } from '../TokenSelector';
import { useTokenBalance } from '../../hooks/useTokenBalance';

const CreateSwap = () => {
  useCullQueries('routes');
  useCullQueries('quote');
  const { isConnected } = useAccount();
  const LiFi = useLiFi();
  const { data: signer } = useSigner();
  const { handleSubmit } = useForm();
  const { tokens } = useTokens();
  const [fromTokenSymbol, toTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const toToken = getTokenBySymbol(toTokenSymbol, tokens);
  const [isLoading, setIsLoading] = useState(false);
  const { routes, isFetching: isFetchingSwapRoutes } = useSwapRoutes();
  const { isFetching: isFetchingQuote } = useQuote();
  const route = routes?.[0];
  const isFromEthereum = fromToken?.address === ETH_CONTRACT_ADDRESS;
  const ShiftInputLabel = { from: 'You pay', to: 'You receive' } as const;

  const { data: fromBalance } = useTokenBalance(fromToken);
  const { data: toBalance } = useTokenBalance(toToken);

  const isToSwapInputLoading = isFetchingQuote || (isFromEthereum && isFetchingSwapRoutes);

  const executeSwap = async () => {
    if (!signer) throw new Error('Signer is missing');
    if (!fromToken || !toToken) throw new Error('Tokens are missing');
    if (!route) throw new Error('Route is missing');

    try {
      // TODO: Can use react-query for this
      setIsLoading(true);
      await LiFi.executeRoute(signer, route);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        showToast({ text: parseErrorMessage(error.message), type: 'error' });
      } else {
        console.error(error);
      }

      setIsLoading(false);
    }
  };

  const { closeTokenSelector, openTokenSelector, tokenSelectorType, isTokenSelectorOpen } =
    useTokenSelector();

  const { setValue, watch } = useFormContext();
  const methods = useFormContext();

  const fromTokenKey = SwapFormKeyHelper.getTokenKey('from');
  const toTokenKey = SwapFormKeyHelper.getTokenKey('to');
  const selectedFromToken = getTokenBySymbol(watch(fromTokenKey), tokens) || undefined;
  const selectedToToken = getTokenBySymbol(watch(toTokenKey), tokens) || undefined;
  const fromId = SwapFormKeyHelper.getAmountKey('from');
  const toId = SwapFormKeyHelper.getAmountKey('to');

  useEffect(() => {
    if (tokens.length > 1) {
      setValue(fromTokenKey, tokens[0].symbol);
      setValue(toTokenKey, tokens[1].symbol);
    }
  }, [tokens]);

  return (
    <div className="m:w-full py-2 sm:max-w-md">
      <div className="bg-white pb-8 shadow sm:rounded-lg">
        <form className="space-y-6" onSubmit={handleSubmit(executeSwap)}>
          <div>
            <div className="py-4">
              <div className="mb-2">
                <ShiftInput
                  label={ShiftInputLabel.from}
                  balance={fromBalance?.formatted}
                  selected={selectedFromToken}
                  id={fromId}
                  openSelector={() => openTokenSelector('from')}
                  formMethods={methods}
                />
              </div>
              <ShiftInput
                label={ShiftInputLabel.to}
                isLoading={isToSwapInputLoading}
                balance={toBalance?.formatted}
                selected={selectedToToken}
                id={toId}
                disabled
                openSelector={() => openTokenSelector('to')}
                formMethods={methods}
              />
              <TokenSelector
                close={closeTokenSelector}
                isOpen={isTokenSelectorOpen}
                type={tokenSelectorType}
              />
              <div className="pt-4">
                <CreateSwapButtons isLoading={isLoading} />
              </div>
            </div>
          </div>
        </form>
      </div>
      {/* Temorary info section */}
      {isConnected && route && (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-smoke text-sm font-medium">USD Value</dt>
            <dd className="font-display text-flashbang-white mt-1 text-sm">
              {route.toAmountUSD} USD
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-smoke text-sm font-medium">Gas Cost</dt>
            <dd className="font-display text-flashbang-white mt-1 text-sm">
              {route.gasCostUSD} USD
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
};

export { CreateSwap };
