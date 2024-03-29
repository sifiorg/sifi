import { useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { ShiftInput, showToast } from '@sifi/shared-ui';
import { useTokens } from 'src/hooks/useTokens';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { getTokenBySymbol } from 'src/utils';
import { SwapFormKey, SwapFormKeyHelper } from 'src/providers/SwapFormProvider';
import { useCullQueries } from 'src/hooks/useCullQueries';
import { useQuote } from 'src/hooks/useQuote';
import { useReferrer } from 'src/hooks/useReferrer';
import { CreateSwapButtons } from '../CreateSwapButtons/CreateSwapButtons';
import { TokenSelector, useTokenSelector } from '../TokenSelector';
import { SwapInformation } from '../SwapInformation';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';
import { ChainSelector } from 'src/components/ChainSelector/ChainSelector';
import { getTokenWithNetwork } from 'src/utils/getTokenWithNetwork';
import { useDefaultTokens } from 'src/hooks/useDefaultTokens';
import { useSyncTokenUrlParams } from 'src/hooks/useSyncTokenUrlParams';
import { enableSwapInformation } from 'src/utils/featureFlags';
import { useUsdValue } from 'src/hooks/useUsdValue';
import { useDepositMax } from 'src/hooks/useDepositMax';
import { useSuggestMevProtection } from 'src/hooks/useSuggestMevProtection';
import { SwapDetails } from '../SwapDetails/SwapDetails';
import { useExecuteSwap } from 'src/hooks/useExecuteSwap';
import { useSwapModal } from 'src/hooks/useSwapModal';

const CreateSwap = () => {
  useCullQueries('quote');
  useSyncTokenUrlParams();
  useReferrer();
  useDefaultTokens();

  const { handleSubmit } = useForm();
  useSuggestMevProtection();
  const {
    fromToken: fromTokenSymbol,
    toToken: toTokenSymbol,
    fromAmount,
    toAmount,
    fromChain,
    toChain,
  } = useSwapFormValues();
  const { fromTokens, toTokens } = useTokens();
  const { executeSwap, isLoading } = useExecuteSwap();
  const { depositMax } = useDepositMax();
  const { isFetching: isFetchingQuote, quote } = useQuote();
  const { openSwapModal, isSwapModalOpen } = useSwapModal();
  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);
  const toToken = getTokenBySymbol(toTokenSymbol, toTokens);
  const ShiftInputLabel = { from: 'From', to: 'To' } as const;
  const { data: fromBalance } = useTokenBalance(fromToken, fromChain.id);
  const { data: toBalance } = useTokenBalance(toToken, toChain.id);
  const isSameTokenPair =
    fromToken && toToken && fromToken.address === toToken.address && fromChain === toChain;
  const isToSwapInputLoading = isFetchingQuote;
  const { closeTokenSelector, openTokenSelector, tokenSelectorType, isTokenSelectorOpen } =
    useTokenSelector();
  const { setValue } = useFormContext();
  const methods = useFormContext();
  const selectedFromToken = getTokenBySymbol(fromTokenSymbol, fromTokens) || undefined;
  const selectedToToken = getTokenBySymbol(toTokenSymbol, toTokens) || undefined;
  const fromId = SwapFormKeyHelper.getAmountKey('from');
  const toId = SwapFormKeyHelper.getAmountKey('to');
  const selectedFromTokenWithNetwork = getTokenWithNetwork(selectedFromToken, fromChain);
  const selectedToTokenWithNetwork = getTokenWithNetwork(selectedToToken, toChain);
  const fromUsdValue = useUsdValue({
    address: fromToken?.address,
    chainId: fromChain.id,
    amount: fromAmount,
  });
  const toUsdValue = useUsdValue({
    address: toToken?.address,
    chainId: toChain?.id,
    amount: toAmount,
  });

  const resetTokenAmounts = () => {
    setValue(SwapFormKey.FromAmount, '');
    setValue(SwapFormKey.ToAmount, '');
  };

  useEffect(() => {
    if (isSameTokenPair) {
      resetTokenAmounts();
    }
  }, [isSameTokenPair]);

  useEffect(() => {
    if (fromToken) {
      setValue(SwapFormKey.FromAmount, '');
    }
  }, [fromToken]);

  const handleSwap = () => {
    if (!quote) {
      showToast({ text: 'Attempted to execute swap without a quote.', type: 'error' });
      console.log('Attempted to execute swap without a quote.');

      return;
    }

    openSwapModal(quote);
    executeSwap();
  };

  return (
    <div className="m:w-full sm:max-w-md">
      <div className={` ${isSwapModalOpen ? 'hidden' : ''} bg-white pb-4 shadow sm:rounded-lg`}>
        <form className="space-y-6" onSubmit={handleSubmit(handleSwap)}>
          <div>
            <div className="pb-2">
              <div>
                <div className="flex justify-between align-bottom items-end">
                  <div className="font-display text-smoke">{ShiftInputLabel.from}</div>
                  <ChainSelector chainToSet={SwapFormKey.FromChain} />
                </div>
                <ShiftInput
                  label={ShiftInputLabel.from}
                  balance={fromBalance?.formatted}
                  selected={selectedFromTokenWithNetwork}
                  id={fromId}
                  openSelector={() => openTokenSelector('from')}
                  formMethods={methods}
                  disabled={Boolean(isSameTokenPair)}
                  max={depositMax}
                  usdValue={fromUsdValue}
                  hideLabel
                />
              </div>
              <div className="flex justify-between align-bottom items-end">
                <div className="font-display text-smoke">{ShiftInputLabel.to}</div>
                <ChainSelector chainToSet={SwapFormKey.ToChain} />
              </div>
              <ShiftInput
                label={ShiftInputLabel.to}
                isLoading={isToSwapInputLoading}
                balance={toBalance?.formatted}
                selected={selectedToTokenWithNetwork}
                id={toId}
                disabled
                openSelector={() => openTokenSelector('to')}
                formMethods={methods}
                hideLabel
                usdValue={toUsdValue}
              />
              <TokenSelector
                close={closeTokenSelector}
                isOpen={isTokenSelectorOpen}
                type={tokenSelectorType}
              />
              <div>
                <SwapDetails />
              </div>
              <div className="pt-4">
                <CreateSwapButtons isLoading={isLoading} />
              </div>
            </div>
          </div>
        </form>
      </div>
      {enableSwapInformation && <SwapInformation />}
    </div>
  );
};

export { CreateSwap };
