import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAccount, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { showToast } from '@sifi/shared-ui';
import { useTokens } from 'src/hooks/useTokens';
import { useMutation } from '@tanstack/react-query';
import { useSifi } from 'src/providers/SDKProvider';
import { getTokenBySymbol, getViemErrorMessage } from 'src/utils';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { useQuote } from 'src/hooks/useQuote';
import { localStorageKeys } from 'src/utils/localStorageKeys';
import { usePermit2 } from 'src/hooks/usePermit2';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';
import { useSpaceTravel } from 'src/providers/SpaceTravelProvider';
import { defaultFeeBps, defaultReferralFeeBps } from 'src/config';
import { useSwapHistory } from 'src/providers/SwapHistoryProvider';
import { useSwapModal } from './useSwapModal';
import { useSwapToast } from './useSwapToast';

const useExecuteSwap = () => {
  const { address } = useAccount();
  const sifi = useSifi();
  const {
    fromToken: fromTokenSymbol,
    toToken: toTokenSymbol,
    fromAmount,
    fromChain,
  } = useSwapFormValues();
  const { data: walletClient } = useWalletClient();
  const { fromTokens, toTokens } = useTokens();
  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);
  const toToken = getTokenBySymbol(toTokenSymbol, toTokens);
  const [isLoading, setIsLoading] = useState(false);
  const { quote } = useQuote();
  const { getPermit2Params } = usePermit2();
  const { setThrottle } = useSpaceTravel();
  const { setValue } = useFormContext();
  const { showSwapToast } = useSwapToast();
  const { dispatch } = useSwapHistory();
  const { setHash } = useSwapModal();

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
      let feeBps = defaultFeeBps;

      if (partnerAddress) {
        feeBps = partnerFeeBps ? Number(partnerFeeBps) : defaultReferralFeeBps;
      }

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
        feeBps,
      });

      const hash = await walletClient.sendTransaction({
        chain: fromChain,
        data: tx.data as `0x${string}`,
        account: tx.from as `0x${string}`,
        to: tx.to as `0x${string}`,
        gas: BigInt(tx.gasLimit),
        value: tx.value !== undefined ? BigInt(tx.value) : undefined,
      });
      setThrottle(1);
      setHash(hash);

      return hash;
    },
    {
      onError: error => {
        setThrottle(0.01);
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
        await showSwapToast({ hash });

        if (!quote) {
          console.warn('Quote is missing, skipping swap event dispatch.');

          return;
        }

        dispatch({
          type: 'ADD_SWAP_EVENT',
          payload: {
            quote,
            createdAt: new Date(),
            status: 'pending',
            hash,
          },
        });

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
