import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAccount, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { useTokens } from 'src/hooks/useTokens';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { useMutation } from '@tanstack/react-query';
import { useSifi } from 'src/providers/SDKProvider';
import { getTokenBySymbol } from 'src/utils';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { useQuote } from 'src/hooks/useQuote';
import { localStorageKeys } from 'src/utils/localStorageKeys';
import { MulticallToken } from 'src/types';
import { useMultiCallTokenBalance } from 'src/hooks/useMulticallTokenBalance';
import { usePermit2 } from 'src/hooks/usePermit2';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';
import { useSpaceTravel } from 'src/providers/SpaceTravelProvider';
import { defaultFeeBps } from 'src/config';
import { useSwapToast } from './useSwapToast';

const useExecuteSwap = () => {
  const { address } = useAccount();
  const sifi = useSifi();
  const {
    fromToken: fromTokenSymbol,
    toToken: toTokenSymbol,
    fromAmount,
    fromChain,
    toChain,
  } = useSwapFormValues();
  const { data: walletClient } = useWalletClient();
  const { showErrorToast, showSuccessToast } = useSwapToast();
  const { fromTokens, toTokens } = useTokens();
  const { refetch: refetchFromTokenBalances } = useMultiCallTokenBalance(
    fromTokens as MulticallToken[],
    fromChain.id
  );
  const { refetch: refetchToTokenBalances } = useMultiCallTokenBalance(
    toTokens as MulticallToken[],
    toChain.id
  );
  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);
  const toToken = getTokenBySymbol(toTokenSymbol, toTokens);
  const [isLoading, setIsLoading] = useState(false);
  const { quote } = useQuote();
  const { refetch: refetchFromBalance } = useTokenBalance(fromToken, fromChain.id);
  const { refetch: refetchToBalance } = useTokenBalance(toToken, toChain.id);
  const { getPermit2Params } = usePermit2();
  const { setThrottle } = useSpaceTravel();
  const { setValue } = useFormContext();

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
          showErrorToast(error);
        } else {
          console.error(error);
        }
      },
      onSettled: () => {
        setIsLoading(false);
        setThrottle(0.01);
      },
      onSuccess: async hash => {
        await showSuccessToast({ fromChain, hash });

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

  return { executeSwap, isLoading };
};

export { useExecuteSwap };
