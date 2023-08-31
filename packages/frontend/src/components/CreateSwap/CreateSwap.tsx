import { useEffect, useState } from 'react';
import { useWatch, useForm, useFormContext } from 'react-hook-form';
import { useAccount, useSigner } from 'wagmi';
import { showToast, ShiftInput } from '@sifi/shared-ui';
import { useTokens } from 'src/hooks/useTokens';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { useMutation } from '@tanstack/react-query';
import { useSifi } from 'src/providers/SDKProvider';
import { formatTokenAmount, getEvmTxUrl, getTokenBySymbol, parseErrorMessage } from 'src/utils';
import { SwapFormKey, SwapFormKeyHelper } from 'src/providers/SwapFormProvider';
import { useCullQueries } from 'src/hooks/useCullQueries';
import { useQuote } from 'src/hooks/useQuote';
import { CreateSwapButtons } from '../CreateSwapButtons/CreateSwapButtons';
import { TokenSelector, useTokenSelector } from '../TokenSelector';

const CreateSwap = () => {
  useCullQueries('quote');
  const { address } = useAccount();
  const sifi = useSifi();
  const { data: signer } = useSigner();
  const { handleSubmit } = useForm();
  const { tokens } = useTokens();
  const [fromTokenSymbol, toTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const toToken = getTokenBySymbol(toTokenSymbol, tokens);
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { quote, isFetching: isFetchingQuote } = useQuote();
  const ShiftInputLabel = { from: 'You pay', to: 'You receive' } as const;
  const { data: fromBalance, refetch: refetchFromBalance } = useTokenBalance(fromToken);
  const { data: toBalance, refetch: refetchToBalance } = useTokenBalance(toToken);
  const isSameTokenPair = fromToken && toToken && fromToken.address === toToken.address;

  const isToSwapInputLoading = isFetchingQuote;

  const mutation = useMutation(
    async () => {
      if (!quote) {
        throw new Error('Quote is missing');
      }
      if (!signer) throw new Error('Signer is missing');
      if (!address) throw new Error('fromAddress is missing');

      const { tx } = await sifi.getSwap({ fromAddress: address, quote });
      const res = await signer.sendTransaction({
        chainId: tx.chainId,
        data: tx.data,
        from: tx.from,
        gasLimit: tx.gasLimit,
        to: tx.to,
        value: tx.value,
      });
      return res;
    },
    {
      onError: error => {
        if (error instanceof Error) {
          showToast({ text: parseErrorMessage(error.message), type: 'error' });
        } else {
          console.error(error);
        }
      },
      onSettled: () => {
        setIsLoading(false);
      },
      onSuccess: async tx => {
        const txHash = tx.hash;
        const explorerLink = getEvmTxUrl('ethereum', txHash);

        showToast({
          text: 'Your swap has been confirmed. Please stand by.',
          type: 'info',
        });

        await tx.wait();

        showToast({
          type: 'success',
          text: 'Your swap has confirmed. It may take a while until it confirms on the blockchain.',
          ...(explorerLink ? { link: { text: 'View Transaction', href: explorerLink } } : {}),
        });

        refetchFromBalance();
        refetchToBalance();
        setValue(SwapFormKey.FromAmount, '');
      },
    }
  );

  const executeSwap = async () => {
    if (!fromToken || !toToken) throw new Error('Tokens are missing');
    if (!address) throw new Error('fromAddress is missing');

    setIsLoading(true);
    mutation.mutate();
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

  useEffect(() => {
    if (isSameTokenPair) {
      setValue(SwapFormKey.FromAmount, '');
      setValue(SwapFormKey.ToAmount, '');
    }
  }, [isSameTokenPair]);

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
                  disabled={Boolean(isSameTokenPair)}
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
      {isConnected && quote && (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          {/* TODO: Add this back in */}
          {/* <div className="sm:col-span-1">
            <dt className="text-smoke text-sm font-medium">USD Value</dt>
            <dd className="font-display text-flashbang-white mt-1 text-sm">
              {route.toAmountUSD} USD
            </dd>
          </div> */}
          <div className="sm:col-span-1">
            <dt className="text-smoke text-sm font-medium">Estimated Gas Cost</dt>
            <dd className="font-display text-flashbang-white mt-1 text-sm">
              {formatTokenAmount(quote.estimatedGas.toString(), 4)} USD
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
};

export { CreateSwap };
