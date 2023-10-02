import { useAccount, useBalance } from 'wagmi';
import type { Token } from '@sifi/sdk';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';

const useTokenBalance = (token: Token | null) => {
  const { address } = useAccount();
  const { fromChain } = useSwapFormValues();
  const isFromEthereum = token?.address === ETH_CONTRACT_ADDRESS;

  return useBalance({
    address,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    token: isFromEthereum ? undefined : (token?.address?.toLowerCase() as `0x${string}`),
    enabled: !!address && !!token?.address,
    chainId: fromChain.id,
  });
};

export { useTokenBalance };
