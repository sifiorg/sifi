import { useState } from 'react';
import { useSifi } from 'src/providers/SDKProvider';
import { useQuery } from 'wagmi';

const useJumpStatus = () => {
  const [hash, setHash] = useState<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(false);
  const sifi = useSifi();

  const {
    data: status,
    isFetching,
    refetch,
  } = useQuery(
    ['jumpStatus', hash],
    async () => {
      if (!hash) return null;
      const result = await sifi.getJump(hash);

      return result.status;
    },
    {
      enabled: shouldPoll,
      refetchInterval: 1000,
    }
  );

  const startPolling = (hash: `0x${string}`) => {
    setHash(hash);
    setShouldPoll(true);
    refetch();
  };

  const stopPolling = () => {
    setShouldPoll(false);
  };

  return { status, isFetching, startPolling, stopPolling };
};

export { useJumpStatus };
