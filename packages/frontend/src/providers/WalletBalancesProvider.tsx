import { createContext, useState, useEffect, PropsWithChildren, FC, useMemo, useRef } from 'react';
import { useAccount } from 'wagmi';
import { BalanceMap } from 'src/types';
import { useQuery } from '@tanstack/react-query';
import { formatTokenAmount } from '@sifi/shared-ui';
import { baseUrl } from 'src/utils';
import { getChainIdByShortName } from 'src/utils/chains';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useSifi } from './SDKProvider';
import Big from 'big.js';
import { SifiError } from '@sifi/sdk';

// TODO: Maybe get this from the SDK?
type TokenBalance = {
  id: `0x${string}`;
  chain: string;
  raw_amount: number;
  decimals: number;
  price?: number;
};

type BalanceMapsByChain = Record<number, BalanceMap>;

const WalletBalancesContext = createContext<{
  balanceMapsByChain: BalanceMapsByChain | null;
  refetch: () => void;
  isLoading: boolean;
  error: unknown;
}>({
  balanceMapsByChain: null,
  refetch: () => {},
  isLoading: false,
  error: null,
});

const useFetchBalances = (address?: string) => {
  const sifi = useSifi();
  const [balanceMapsByChain, setBalanceMapsByChain] = useState<BalanceMapsByChain | null>(null);
  const [isLoadingUsdValue, setIsLoadingUsdValue] = useState(false);
  const isFirstFetch = useRef(true);

  const calculateUsdValue = async (tokenId: string, chainId: number, balance: string) => {
    try {
      const usdPriceData = await sifi.getUsdPrice(chainId, tokenId);
      const usdPricePerToken = usdPriceData?.usdPrice || '0';

      return Big(balance).times(usdPricePerToken).toFixed(2);
    } catch (error) {
      if (error instanceof SifiError && error.message.includes('Could not resolve Coingecko ID')) {
        // Skipping these to avoid spamming the console
        return null;
      }
      console.error(`Error fetching USD price for token ${tokenId}:`, error);

      return null;
    }
  };

  const {
    refetch,
    isLoading: isLoadingBalances,
    error,
  } = useQuery(
    ['balances', address],
    async () => {
      const response = await fetch(`${baseUrl}/balances/${address}`);

      return response.json();
    },
    {
      enabled: !!address,
      staleTime: 1000 * 60 * 1, // 1 minute
      refetchOnWindowFocus: false,
      onSuccess: async data => {
        if (isFirstFetch.current) {
          setIsLoadingUsdValue(true);
        }

        const balancePromises = data.map((token: TokenBalance) => {
          return (async () => {
            const chainId = getChainIdByShortName(token.chain);
            // The API returns the same string as for `chain` for native tokens,
            // so we can use this util to check if it's a native token
            const isNativeToken = getChainIdByShortName(token.id) !== null;
            const tokenId = isNativeToken
              ? ETH_CONTRACT_ADDRESS.toLowerCase()
              : token.id.toLowerCase();

            if (chainId !== null && token.raw_amount && token.decimals) {
              const formattedBalance = formatTokenAmount(String(token.raw_amount), token.decimals);
              const usdValue = await calculateUsdValue(tokenId, chainId, formattedBalance);

              return { chainId, tokenId, formattedBalance, usdValue };
            }
          })();
        });

        Promise.all(balancePromises)
          .then(balances => {
            const newBalanceMapsByChain = balances.reduce<Record<number, BalanceMap>>(
              (acc, balance) => {
                if (!balance) {
                  console.error('Encountered undefined balance object');

                  return acc;
                }

                const { chainId, tokenId, formattedBalance, usdValue } = balance;
                const map = acc[chainId] ?? new Map();

                map.set(tokenId as `0x${string}`, {
                  balance: formattedBalance,
                  usdValue,
                });

                return {
                  ...acc,
                  [chainId]: map,
                };
              },
              {}
            );

            setBalanceMapsByChain(newBalanceMapsByChain);

            if (isFirstFetch.current) {
              setIsLoadingUsdValue(false);
              isFirstFetch.current = false;
            }
          })
          .catch(error => {
            console.error('An error occurred while fetching balances:', error);

            if (isFirstFetch.current) {
              setIsLoadingUsdValue(false);
              isFirstFetch.current = false;
            }
          });
      },
    }
  );

  useEffect(() => {
    if (address) {
      refetch();
    }
  }, [address]);

  return {
    balanceMapsByChain,
    refetch,
    isLoadingBalances: address ? isLoadingBalances : false,
    error,
    isLoadingUsdValue,
  };
};

const WalletBalancesProvider: FC<PropsWithChildren> = ({ children }) => {
  const { address } = useAccount();
  const { balanceMapsByChain, refetch, isLoadingBalances, error, isLoadingUsdValue } =
    useFetchBalances(address);

  const contextValue = useMemo(
    () => ({
      balanceMapsByChain,
      refetch,
      isLoading: isLoadingBalances || isLoadingUsdValue,
      error,
    }),
    [balanceMapsByChain, refetch, isLoadingBalances, error, isLoadingUsdValue]
  );

  return (
    <WalletBalancesContext.Provider value={contextValue}>{children}</WalletBalancesContext.Provider>
  );
};

export { WalletBalancesProvider, WalletBalancesContext };
