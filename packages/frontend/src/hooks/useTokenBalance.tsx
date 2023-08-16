import { useAccount, useBalance } from 'wagmi';
import type { Token } from '@sifi/sdk';
import { ETH_CONTRACT_ADDRESS } from '../constants';

const useTokenBalance = (token: Token | null) => {
  const { address } = useAccount();
  const isFromEthereum = token?.address === ETH_CONTRACT_ADDRESS;

  return useBalance({
    address,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    token: isFromEthereum ? undefined : (token?.address?.toLowerCase() as `0x${string}`),
    enabled: !!address && !!token?.address,
  });
};

export { useTokenBalance };
