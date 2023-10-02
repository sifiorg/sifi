import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { showToast, ShiftInput } from '@sifi/shared-ui';
import { useTokens } from 'src/hooks/useTokens';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { useMutation } from '@tanstack/react-query';
import { useSifi } from 'src/providers/SDKProvider';
import { getEvmTxUrl, getTokenBySymbol, getViemErrorMessage } from 'src/utils';
import { SwapFormKey, SwapFormKeyHelper } from 'src/providers/SwapFormProvider';
import { useCullQueries } from 'src/hooks/useCullQueries';
import { useSpendableBalance } from 'src/hooks/useSpendableBalance';
import { useQuote } from 'src/hooks/useQuote';
import { useReferrer } from 'src/hooks/useReferrer';
import { localStorageKeys } from 'src/utils/localStorageKeys';
import { CreateSwapButtons } from '../CreateSwapButtons/CreateSwapButtons';
import { TokenSelector, useTokenSelector } from '../TokenSelector';
import { SwapInformation } from '../SwapInformation';
import { MulticallToken } from 'src/types';
import { useMultiCallTokenBalance } from 'src/hooks/useMulticallTokenBalance';
import { usePermit2 } from 'src/hooks/usePermit2';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';
import { getTokenWithNetwork } from 'src/utils/getTokenWithNetwork';

const CreateSwap = () => {
  useCullQueries('quote');
  const { address, isConnected } = useAccount();
  const sifi = useSifi();
  const {
    fromToken: fromTokenSymbol,
    toToken: toTokenSymbol,
    fromAmount,
    fromChain,
    toChain,
  } = useSwapFormValues();
  const publicClient = usePublicClient({ chainId: fromChain.id });
  const { data: walletClient } = useWalletClient();
  const { handleSubmit } = useForm();
  const { tokens } = useTokens();
  const { balanceMap, refetch: refetchTokenBalances } = useMultiCallTokenBalance(
    tokens as MulticallToken[]
  );
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const toToken = getTokenBySymbol(toTokenSymbol, tokens);
  const [isLoading, setIsLoading] = useState(false);
  const { quote, isFetching: isFetchingQuote } = useQuote();
  const ShiftInputLabel = { from: 'You pay', to: 'You receive' } as const;
  const { data: fromBalance, refetch: refetchFromBalance } = useTokenBalance(fromToken);
  const { data: toBalance, refetch: refetchToBalance } = useTokenBalance(toToken);
  const { getPermit2Params } = usePermit2();
  const isSameTokenPair = fromToken && toToken && fromToken.address === toToken.address;

  const isToSwapInputLoading = isFetchingQuote;

  useReferrer();

  const mutation = useMutation(
    async () => {
      if (!quote) {
        throw new Error('Quote is missing');
      }
      if (!walletClient) throw new Error('WalletClient not initialised');
      if (!address) throw new Error('fromAddress is missing');
      if (!fromToken) throw new Error('fromToken is missing');

      const partnerAddress = localStorage.getItem(localStorageKeys.REFFERRER_ADDRESS);
      const partnerFeeBps = localStorage.getItem(localStorageKeys.REFERRER_FEE_BPS);

      const permit =
        quote.approveAddress && quote.permit2Address
          ? await getPermit2Params({
              tokenAddress: fromToken.address,
              userAddress: address,
              spenderAddress: quote.approveAddress,
              permit2Address: quote.permit2Address,
              amount: parseUnits(fromAmount, fromToken.decimals),
            })
          : undefined;

      const { tx } = await sifi.getSwap({
        fromAddress: address,
        quote,
        permit,
        partner: partnerAddress || undefined,
        feeBps: partnerFeeBps && partnerAddress ? Number(partnerFeeBps) : undefined,
      });
      const res = await walletClient.sendTransaction({
        chain: fromChain,
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
        const explorerLink = getEvmTxUrl(fromChain, hash);

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
  const spendableBalance = useSpendableBalance({ token: fromToken });
  const depositMax = isConnected ? spendableBalance : undefined;

  const selectedFromTokenWithNetwork = getTokenWithNetwork(selectedFromToken, fromChain);
  const selectedToTokenWithNetwork = getTokenWithNetwork(selectedToToken, toChain);

  const resetTokenAmounts = () => {
    setValue(SwapFormKey.FromAmount, '');
    setValue(SwapFormKey.ToAmount, '');
  };

  useEffect(() => {
    if (tokens.length > 1) {
      setValue(fromTokenKey, tokens[0].symbol);
      setValue(toTokenKey, tokens[1].symbol);
    }
  }, [tokens]);

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
                  selected={selectedFromTokenWithNetwork}
                  id={fromId}
                  openSelector={() => openTokenSelector('from')}
                  formMethods={methods}
                  disabled={Boolean(isSameTokenPair)}
                  max={depositMax}
                />
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
