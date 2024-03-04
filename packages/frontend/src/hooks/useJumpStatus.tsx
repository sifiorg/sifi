import { JumpStatus } from '@sifi/sdk';
import { useRef, useState } from 'react';
import { useSifi } from 'src/providers/SDKProvider';
import { useQuery } from 'wagmi';

const useJumpStatus = () => {
  const [hash, setHash] = useState<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const sifi = useSifi();
  const previousStatusRef = useRef<JumpStatus | null>(null);

  const {
    data: status,
    isFetching,
    refetch,
  } = useQuery(
    ['jumpStatus', hash],
    async () => {
      if (!hash) return previousStatusRef.current;

      const result = await sifi.getJump(hash);

      if (result.status === 'success') {
        stopPolling();
      } else if (result.status) {
        previousStatusRef.current = result.status;
      }

      return result.status || previousStatusRef.current;
    },
    {
      enabled: shouldPoll,
      refetchInterval: 1000,

      refetchIntervalInBackground: true,
      onError: error => {
        stopPolling();
        setError(error instanceof Error ? error : new Error('An error occurred'));
      },
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

  const getStatusText = (): string => {
    if (!status) return 'Processing...';
    if (error) return 'An error occurred while fetching jump status.';

    switch (status) {
      case 'pending':
        return 'In hyperspace. Arrival imminent...';
      case 'inflight':
        return 'Arriving...';
      case 'success':
        return 'Jump completed.';
      case 'unknown':
        return 'Signal lost in the cosmic void. Status unknown.';
    }
  };

  return {
    status,
    isFetching,
    startPolling,
    stopPolling,
    error,
    statusText: getStatusText(),
  };
};

export { useJumpStatus };
