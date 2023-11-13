import { useQuery } from '@tanstack/react-query';
import { showToast } from '@sifi/shared-ui';
import { getOrderedTokenList } from 'src/utils/tokens';
import { useSifi } from 'src/providers/SDKProvider';

const useFetchTokens = (chainIds: number[]) => {
  const sifi = useSifi();

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

  return { fetchTokens, data };
};

export { useFetchTokens };
