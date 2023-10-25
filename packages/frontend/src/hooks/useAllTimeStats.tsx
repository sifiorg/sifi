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

const useAllTimeStats = () => {
  return useQuery(
    ['allTimeStats'],
    async () => {
      const responses = (await Promise.all(
        Object.values(GRAPH_URLS).map(url =>
          request(url, ALL_TIME_STATS_QUERY).catch((error: any) => {
            console.error(`Failed to fetch data from ${url}:`, error);

            return { allTimeStats: { volumeUsd: '0' } };
          })
        )
      )) as AllTimeStatsResponse[];

      const totalVolumeUsd = responses.reduce(
        (sum: number, response: AllTimeStatsResponse) =>
          sum + Number(response.allTimeStats?.volumeUsd ?? '0'),
        0
      );

      return Math.round(totalVolumeUsd);
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
};

export { useAllTimeStats };
