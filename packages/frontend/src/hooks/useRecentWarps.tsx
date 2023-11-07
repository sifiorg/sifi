import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import GRAPH_URLS from 'src/subgraph.json';
import { SUPPORTED_CHAINS } from 'src/utils/chains';

const RECENT_WARPS_QUERY = gql`
  query recentWarps($since: BigInt!) {
    warps(first: 5, where: { addedAt_gt: $since }, orderBy: addedAt, orderDirection: desc) {
      id
      addedAt
      amountInDecimal
      tokenIn {
        symbol
      }
      amountOutDecimal
      amountOut
      tokenOut {
        symbol
      }
    }
  }
`;

type Warp = {
  id: string;
  addedAt: string;
  chainId: number;
  amountInDecimal: string;
  tokenIn: {
    symbol: string;
  };
  amountOutDecimal: string;
  amountOut: string;
  tokenOut: {
    symbol: string;
  };
};

type RecentWarpsResponse = {
  warps: Warp[];
};

type GraphUrls = {
  [key: string]: string;
};

const getRecentWarpsForChainId = async (chainId: number): Promise<Warp[]> => {
  const url = (GRAPH_URLS as GraphUrls)[chainId.toString()];

  if (!url) return [];

  const response: RecentWarpsResponse = await request(url, RECENT_WARPS_QUERY, { since: '0' });

  return response.warps.map(warp => ({ ...warp, chainId })) as Warp[];
};

const useRecentWarps = () => {
  return useQuery(
    ['recentWarps'],
    async () => {
      const responses = await Promise.allSettled(
        SUPPORTED_CHAINS.map(({ id }) => getRecentWarpsForChainId(id))
      );

      return responses
        .map(response => {
          if (
            response.status === 'fulfilled' &&
            (response satisfies PromiseFulfilledResult<Warp[]>) &&
            response.value?.length
          ) {
            return response.value;
          }

          return [];
        })
        .flat()
        .sort((a, b) => (Number(a.addedAt) < Number(b.addedAt) ? 1 : -1))
        .slice(0, 10);
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
};

export { useRecentWarps };
