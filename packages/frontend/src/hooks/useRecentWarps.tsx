import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import GRAPH_URLS from 'src/subgraph.json';
import { useSwapFormValues } from './useSwapFormValues';

const RECENT_WARPS_QUERY = gql`
  query recentWarps($since: BigInt!) {
    warps(first: 5, where: { addedAt_gt: $since }, orderBy: addedAt, orderDirection: desc) {
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
  addedAt: string;
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

const useRecentWarps = () => {
  const { fromChain } = useSwapFormValues();

  return useQuery(
    ['recentWarps', fromChain.id.toString()],
    async () => {
      const url = (GRAPH_URLS as GraphUrls)[fromChain.id];
      const response: RecentWarpsResponse = await request(url, RECENT_WARPS_QUERY, { since: '0' });

      return response.warps as Warp[];
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
};

export { useRecentWarps };
