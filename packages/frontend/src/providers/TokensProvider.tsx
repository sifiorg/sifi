import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import {
  type FunctionComponent,
  type ReactNode,
  createContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { showToast } from '@sifi/shared-ui';
import { getOrderedTokenList } from 'src/utils/tokens';
import { enableUnlistedTokenTrading } from 'src/utils/featureFlags';
import { useSifi } from './SDKProvider';
import type { Token } from '@sifi/sdk';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';
import { Chain } from 'viem';
import { firstAndLast } from 'src/utils';

const TokensContext = createContext<{
  fromTokens: Token[];
  toTokens: Token[];
  isLoading: boolean;
  fetchFromTokenByAddress?: (address: `0x${string}`) => Promise<void>;
  fetchToTokenByAddress?: (address: `0x${string}`) => Promise<void>;
}>({
  fromTokens: [],
  toTokens: [],
  isLoading: true,
});

const TokensProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const sifi = useSifi();
  const { fromChain, toChain } = useSwapFormValues();
  const [fromTokens, setFromTokens] = useState<Token[]>([]);
  const [toTokens, setToTokens] = useState<Token[]>([]);

  const { refetch: refetchFromTokens } = useQuery(
    ['tokens'],
    async () => {
      const data = await sifi.getTokens(fromChain.id);

      return getOrderedTokenList(data);
    },
    { enabled: false }
  );

  const { refetch: refetchToTokens } = useQuery(
    ['tokens'],
    async () => {
      const data = await sifi.getTokens(toChain.id);

      return getOrderedTokenList(data);
    },
    { enabled: false }
  );

  const fetchTokens = async (
    chain: Chain,
    setTokens: React.Dispatch<React.SetStateAction<Token[]>>,
    refetchTokens: () => Promise<QueryObserverResult<Token[], unknown>>
  ) => {
    try {
      const { data: tokensData } = await refetchTokens();
      if (tokensData) {
        setTokens(tokensData);
      }
    } catch (error) {
      showToast({
        text: `Failed to fetch tokens for ${chain.name}`,
        type: 'error',
      });
    }
  };

  const appendTokenFetchedByAddress = async (
    chain: Chain,
    address: string,
    tokens: Token[],
    setTokens: React.Dispatch<React.SetStateAction<Token[]>>
  ) => {
    const token = tokens?.find(token => token.address.toLowerCase() === address.toLowerCase());
    if (!token) {
      try {
        const fetchedToken = await sifi.getToken(chain.id, address);
        if (fetchedToken) {
          setTokens(tokens => [...tokens, fetchedToken]);
        }
      } catch (error) {
        showToast({
          text: `Failed to fetch token with address ${firstAndLast(address)} for ${chain.name}`,
          type: 'error',
        });
      }
    }
  };

  useEffect(() => {
    fetchTokens(fromChain, setFromTokens, refetchFromTokens);
  }, [fromChain, setFromTokens, refetchFromTokens]);

  useEffect(() => {
    fetchTokens(toChain, setToTokens, refetchToTokens);
  }, [toChain, setToTokens, refetchToTokens]);

  const value = useMemo(() => {
    return {
      fromTokens: fromTokens || [],
      toTokens: toTokens || [],
      isLoading: !fromTokens || !toTokens,
      fetchFromTokenByAddress: enableUnlistedTokenTrading
        ? (address: string) =>
            appendTokenFetchedByAddress(fromChain, address, fromTokens, setFromTokens)
        : undefined,
      fetchToTokenByAddress: enableUnlistedTokenTrading
        ? (address: string) => appendTokenFetchedByAddress(toChain, address, toTokens, setToTokens)
        : undefined,
    };
  }, [fromTokens, toTokens]);

  return <TokensContext.Provider value={value}>{children}</TokensContext.Provider>;
};

export { TokensContext, TokensProvider };
