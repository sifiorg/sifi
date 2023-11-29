import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import GRAPH_URLS from 'src/subgraph.json';

const ALL_TIME_STATS_QUERY = gql`
  query {
    allTimeStats(id: "current") {
      volumeUsd
    }
  }
`;

type AllTimeStatsResponse = {
  allTimeStats: {
    volumeUsd: string;
  };
};

const FIVE_MINUTES = 1000 * 60 * 5;

const useAllTimeStats = () => {

  const fetchAllTimeStats = async () => {
    const responses = await Promise.all(
      Object.entries(GRAPH_URLS).map(([chainId, url]) =>
        request(url, ALL_TIME_STATS_QUERY)
          .then<AllTimeStatsResponse>()
          .catch((error: any) => {
            console.error(`Failed to fetch data for ${chainId}:`, error);

            return { allTimeStats: { volumeUsd: '0' } };
          })
      )
    );

    const totalVolumeUsd = responses.reduce(
      (sum: number, response: AllTimeStatsResponse) =>
        sum + Number(response.allTimeStats?.volumeUsd ?? '0'),
      0
    );

    return Math.round(totalVolumeUsd);
  };

  return useQuery({
    queryKey: ['allTimeStats'],
    queryFn: fetchAllTimeStats,
    staleTime: FIVE_MINUTES,
    refetchOnWindowFocus: false,
  });
};

export { useAllTimeStats };
