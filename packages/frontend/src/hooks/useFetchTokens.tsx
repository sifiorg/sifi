import { useQuery } from '@tanstack/react-query';
import { showToast } from '@sifi/shared-ui';
import { getOrderedTokenList } from 'src/utils/tokens';
import { useSifi } from 'src/providers/SDKProvider';
import { useEffect, useState } from 'react';
import { Token } from '@sifi/sdk';

const useFetchTokens = (chainIds: number[]) => {
  const sifi = useSifi();
  const [tokensByAddress, setTokensByAddress] = useState<Record<string, Token>>({});

  const { data, refetch } = useQuery(
    ['tokens', chainIds],
    async () => {
      const allTokens = await Promise.all(
        chainIds.map(async chainId => {
          const data = await sifi.getTokens(chainId);
          return getOrderedTokenList(data);
        })
      );
      return allTokens.flat();
    },
    { enabled: false }
  );

  const fetchTokens = async () => {
    try {
      const { data: tokensData } = await refetch();
      if (tokensData) {
        const lookup = tokensData.reduce<Record<string, Token>>((acc, token) => {
          acc[token.address.toLowerCase()] = token;
          return acc;
        }, {});
        setTokensByAddress(lookup);

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

  return { fetchTokens, data, tokensByAddress };
};

export { useFetchTokens };
