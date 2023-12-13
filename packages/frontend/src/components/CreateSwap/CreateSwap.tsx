import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useAccount, useWalletClient, usePublicClient, useNetwork } from 'wagmi';
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
import { ChainSelector } from 'src/components/ChainSelector/ChainSelector';
import { getTokenWithNetwork } from 'src/utils/getTokenWithNetwork';
import { useDefaultTokens } from 'src/hooks/useDefaultTokens';
import { useSyncTokenUrlParams } from 'src/hooks/useSyncTokenUrlParams';
import { enableSwapInformation } from 'src/utils/featureFlags';
import { useUsdValue } from 'src/hooks/useUsdValue';
import { useSpaceTravel } from 'src/providers/SpaceTravelProvider';
import { defaultFeeBps } from 'src/config';

const CreateSwap = () => {
  useCullQueries('quote');
  useSyncTokenUrlParams();
  const { address, isConnected } = useAccount();
  const sifi = useSifi();
  const {
    fromToken: fromTokenSymbol,
    toToken: toTokenSymbol,
    fromAmount,
    toAmount,
    fromChain,
    toChain,
  } = useSwapFormValues();
  const publicClient = usePublicClient({ chainId: fromChain.id });
  const { data: walletClient } = useWalletClient();
  const { handleSubmit } = useForm();
  const { fromTokens, toTokens } = useTokens();
  const { balanceMap: fromBalanceMap, refetch: refetchFromTokenBalances } =
    useMultiCallTokenBalance(fromTokens as MulticallToken[], fromChain.id);

  const { balanceMap: toTokenBalanceMap, refetch: refetchToTokenBalances } =
    useMultiCallTokenBalance(toTokens as MulticallToken[], toChain.id);
  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);
  const toToken = getTokenBySymbol(toTokenSymbol, toTokens);
  const [isLoading, setIsLoading] = useState(false);
  const { quote, isFetching: isFetchingQuote } = useQuote();
  const ShiftInputLabel = { from: 'From', to: 'To' } as const;
  const { data: fromBalance, refetch: refetchFromBalance } = useTokenBalance(
    fromToken,
    fromChain.id
  );
  const { data: toBalance, refetch: refetchToBalance } = useTokenBalance(toToken, toChain.id);
  const { getPermit2Params } = usePermit2();
  const isSameTokenPair =
    fromToken && toToken && fromToken.address === toToken.address && fromChain === toChain;

  const isToSwapInputLoading = isFetchingQuote;

  const { setThrottle } = useSpaceTravel();

  useReferrer();
  useDefaultTokens();

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
        feeBps: partnerFeeBps && partnerAddress ? Number(partnerFeeBps) : defaultFeeBps,
      });

      const res = await walletClient.sendTransaction({
        chain: fromChain,
        data: tx.data as `0x${string}`,
        account: tx.from as `0x${string}`,
        to: tx.to as `0x${string}`,
        gas: BigInt(tx.gasLimit),
        value: tx.value !== undefined ? BigInt(tx.value) : undefined,
      });
      setThrottle(1);

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
        setThrottle(0.01);
      },
      onSuccess: async hash => {
        const isJump = fromChain.id !== toChain.id;
        let explorerLink: string | undefined;
        if (isJump) {
          explorerLink = `https://layerzeroscan.com/tx/${hash}`;
        } else {
          explorerLink = fromChain ? getEvmTxUrl(fromChain, hash) : undefined;
        }

        showToast({
          text: 'Your swap has been confirmed. Please stand by.',
          type: 'info',
        });

        await publicClient.waitForTransactionReceipt({ hash });

        showToast({
          type: 'success',
          text: 'Your swap has confirmed. It may take a while until it confirms on the blockchain.',
          ...(explorerLink ? { link: { text: 'View Transaction', href: explorerLink } } : {}),
          autoClose: false,
        });

        refetchFromBalance();
        refetchToBalance();
        refetchFromTokenBalances();
        refetchToTokenBalances();
        setValue(SwapFormKey.FromAmount, '');
      },
    }
  );

  const executeSwap = async () => {
    if (!fromToken || !toToken) throw new Error('Tokens are missing');
    if (!address) throw new Error('fromAddress is missing');

    setThrottle(0.25);
    setIsLoading(true);
    mutation.mutate();
  };
  const { closeTokenSelector, openTokenSelector, tokenSelectorType, isTokenSelectorOpen } =
    useTokenSelector();

  const { setValue } = useFormContext();
  const methods = useFormContext();
  const selectedFromToken = getTokenBySymbol(fromTokenSymbol, fromTokens) || undefined;
  const selectedToToken = getTokenBySymbol(toTokenSymbol, toTokens) || undefined;
  const fromId = SwapFormKeyHelper.getAmountKey('from');
  const toId = SwapFormKeyHelper.getAmountKey('to');
  const spendableBalance = useSpendableBalance({ token: fromToken });
  const depositMax = isConnected ? spendableBalance : undefined;
  const selectedFromTokenWithNetwork = getTokenWithNetwork(selectedFromToken, fromChain);
  const selectedToTokenWithNetwork = getTokenWithNetwork(selectedToToken, toChain);
  const { chain } = useNetwork();
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
  const userIsConnectedToWrongNetwork = Boolean(
    chain?.id && fromToken?.chainId && chain.id !== fromToken.chainId
  );

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

  return (
    <div className="m:w-full sm:max-w-md">
      <div className="bg-white pb-4 shadow sm:rounded-lg">
        <form className="space-y-6" onSubmit={handleSubmit(executeSwap)}>
          <div>
            <div className="pb-2">
              <div className="mb-2">
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
                  max={userIsConnectedToWrongNetwork ? undefined : depositMax}
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
                balanceMap={tokenSelectorType === 'from' ? fromBalanceMap : toTokenBalanceMap}
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
      {enableSwapInformation && <SwapInformation />}
    </div>
  );
};

export { CreateSwap };
