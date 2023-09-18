import { useEffect, useState } from 'react';
import { useWatch, useForm, useFormContext } from 'react-hook-form';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { mainnet } from 'viem/chains';
import { showToast, ShiftInput } from '@sifi/shared-ui';
import { useTokens } from 'src/hooks/useTokens';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { useMutation } from '@tanstack/react-query';
import { useSifi } from 'src/providers/SDKProvider';
import { getEvmTxUrl, getTokenBySymbol, getViemErrorMessage, parseErrorMessage } from 'src/utils';
import { SwapFormKey, SwapFormKeyHelper } from 'src/providers/SwapFormProvider';
import { useCullQueries } from 'src/hooks/useCullQueries';
import { useQuote } from 'src/hooks/useQuote';
import { CreateSwapButtons } from '../CreateSwapButtons/CreateSwapButtons';
import { TokenSelector, useTokenSelector } from '../TokenSelector';
import { SwapInformation } from '../SwapInformation';
import { MulticallToken } from 'src/types';
import { useMultiCallTokenBalance } from 'src/hooks/useMulticallTokenBalance';

const CreateSwap = () => {
  useCullQueries('quote');
  const { address } = useAccount();
  const sifi = useSifi();
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();
  const { handleSubmit } = useForm();
  const { tokens } = useTokens();
  const { balanceMap, refetch: refetchTokenBalances } = useMultiCallTokenBalance(tokens as MulticallToken[]);
  const [fromTokenSymbol, toTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const toToken = getTokenBySymbol(toTokenSymbol, tokens);
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
      if (!walletClient) throw new Error('WalletClient not initialised');
      if (!address) throw new Error('fromAddress is missing');

      const { tx } = await sifi.getSwap({ fromAddress: address, quote });
      const res = await walletClient.sendTransaction({
        chain: mainnet,
        data: tx.data as `0x${string}`,
        account: tx.from as `0x${string}`,
        to: tx.to as `0x${string}`,
        gas: BigInt(tx.gasLimit),
        value: tx.value !== undefined ? BigInt(tx.value) : undefined,
      });

      return res;
    },
    {
      onError: error => {
        if (error instanceof Error) {
          showToast({ text: getViemErrorMessage(error), type: 'error' });
        } else {
          console.error(error);
        }
      },
      onSettled: () => {
        setIsLoading(false);
      },
      onSuccess: async hash => {
        const explorerLink = getEvmTxUrl('ethereum', hash);

        showToast({
          text: 'Your swap has been confirmed. Please stand by.',
          type: 'info',
        });

        await publicClient.waitForTransactionReceipt({ hash });

        showToast({
          type: 'success',
          text: 'Your swap has confirmed. It may take a while until it confirms on the blockchain.',
          ...(explorerLink ? { link: { text: 'View Transaction', href: explorerLink } } : {}),
        });

        refetchFromBalance();
        refetchToBalance();
        refetchTokenBalances();
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
                balanceMap={balanceMap}
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
      <SwapInformation />
    </div>
  );
};

export { CreateSwap };
