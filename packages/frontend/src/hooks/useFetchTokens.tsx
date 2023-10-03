import { useQuery } from '@tanstack/react-query';
import { showToast } from '@sifi/shared-ui';
import { getOrderedTokenList } from 'src/utils/tokens';
import { useSifi } from 'src/providers/SDKProvider';

const useFetchTokens = (chainId: number) => {
  const sifi = useSifi();

  const { refetch } = useQuery(
    ['tokens', chainId],
    async () => {
      const data = await sifi.getTokens(chainId);
      return getOrderedTokenList(data);
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
        text: `Failed to fetch tokens for ${chainId}`,
        type: 'error',
      });
    }
    return [];
  };

  return { fetchTokens };
};

export { useFetchTokens };
