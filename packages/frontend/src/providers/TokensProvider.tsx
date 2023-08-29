import { useQuery } from '@tanstack/react-query';
import {
  type FunctionComponent,
  type ReactNode,
  createContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { getOrderedTokenList } from 'src/utils/tokens';
import { enableUnlistedTokenTrading } from 'src/utils/featureFlags';
import { useSifi } from './SDKProvider';
import type { Token } from '@sifi/sdk';

const TokensContext = createContext<{
  tokens: Token[];
  isLoading: boolean;
  fetchTokenByAddress?: (address: `0x${string}`) => Promise<void>;
}>({
  tokens: [],
  isLoading: true,
});

const TokensProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const sifi = useSifi();
  const selectedChainId = 1;
  const [tokens, setTokens] = useState<Token[]>([]);

  const { refetch } = useQuery(
    ['tokens'],
    async () => {
      const data = await sifi.getTokens(selectedChainId);

      return getOrderedTokenList(data);
    },
    { enabled: false }
  );

  const fetchTokens = async () => {
    const { data: tokens } = await refetch();

    if (tokens) {
      setTokens(tokens);
    }
  };

  const appendTokenFetchedByAddress = async (address: `0x${string}`) => {
    const token = tokens?.find(token => token.address.toLowerCase() === address.toLowerCase());
    if (!token) {
      // TODO fix this
      const fetchedToken = await sifi.getToken(selectedChainId, address);
      if (fetchedToken) {
        setTokens(tokens => [...tokens, fetchedToken]);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchTokens();
  }, []);

  const value = useMemo(() => {
    return {
      tokens: tokens || [],
      isLoading: !tokens,
      fetchTokenByAddress: enableUnlistedTokenTrading ? appendTokenFetchedByAddress : undefined,
    };
  }, [tokens]);

  return <TokensContext.Provider value={value}>{children}</TokensContext.Provider>;
};

export { TokensContext, TokensProvider };
