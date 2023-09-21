import { useCallback } from 'react';
import { Chain } from 'viem';
import { useWalletClient } from 'wagmi';

const useAddNetwork = () => {
  const { data: walletClient } = useWalletClient();
  const addNetwork = useCallback(async (chain: Chain) => {
    if (walletClient) {
      await walletClient.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chain.id.toString(16)}`,
            chainName: chain.name,
            nativeCurrency: {
              name: chain.nativeCurrency.name,
              symbol: chain.nativeCurrency.symbol,
              decimals: chain.nativeCurrency.decimals,
            },
            rpcUrls: chain.rpcUrls.default.http,
            blockExplorerUrls: chain.blockExplorers?.default.url
              ? [chain.blockExplorers.default.url]
              : [],
          },
        ],
      });
    } else {
      console.error('Ethereum object does not exist on window, or does not have a request method.');
    }
  }, []);

  return { addNetwork };
};

export { useAddNetwork };
