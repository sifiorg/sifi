import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { showToast } from '@sifi/shared-ui';
import { getOrderedTokenList } from 'src/utils/tokens';
import { useSifi } from 'src/providers/SDKProvider';
import { Token } from '@sifi/sdk';

const useFetchTokens = (chainIds: number[]) => {
  const sifi = useSifi();
  const [tokensByChainIdAndAddress, setTokensByChainIdAndAddress] = useState<Record<string, Token>>(
    {}
  );

  const { data, refetch } = useQuery({
    queryKey: ['tokens', chainIds],
    queryFn: async () => {
      const allTokens = await Promise.all(
        chainIds.map(async chainId => {
          const data = await sifi.getTokens(chainId);
          return getOrderedTokenList(data);
        })
      );
      return allTokens.flat();
    },
    enabled: false
  });

  const fetchTokens = async () => {
    try {
      const { data: tokensData } = await refetch();
      if (tokensData) {
        const lookup = tokensData.reduce<Record<string, Token>>((acc, token) => {
          const key = `${token.chainId}-${token.address.toLowerCase()}`;
          acc[key] = token;

          return acc;
        }, {});
        setTokensByChainIdAndAddress(lookup);

        return tokensData;
      }
    } catch (error) {
      showToast({
        text: `Failed to fetch tokens.`,
        type: 'error',
      });
    }
    return [];
  };

  return { fetchTokens, data, tokensByChainIdAndAddress };
};

export { useFetchTokens };
