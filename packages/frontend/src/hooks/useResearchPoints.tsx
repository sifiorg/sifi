import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

const fetchPoints = async (address: `0x${string}`) => {
  const response = await fetch(`https://api.sifi.org/v1/points/${address}`);
  const data = await response.json();

  return data.total;
};

const RESERACH_POINTS_QUERY_KEY = 'researchPoints';

const useResearchPoints = () => {
  const { address } = useAccount();
  return useQuery(
    [RESERACH_POINTS_QUERY_KEY, address],
    () => {
      if (address) {
        return fetchPoints(address);
      } else {
        throw new Error('Address is undefined');
      }
    },
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
};

const useRefetchResearchPoints = () => {
  const queryClient = useQueryClient();

  const refetchResearchPoints = () => queryClient.invalidateQueries([RESERACH_POINTS_QUERY_KEY]);

  return { refetchResearchPoints };
};

export { useResearchPoints, useRefetchResearchPoints };
