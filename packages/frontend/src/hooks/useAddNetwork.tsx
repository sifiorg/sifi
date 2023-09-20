import { useCallback } from 'react';

const useAddNetwork = () => {
  const addNetwork = useCallback(async (chain: SelectedChain) => {
    const { ethereum } = window;

    if (ethereum && ethereum.request) {
      const params = [
        {
          chainId: `0x${chain.id.toString(16)}`,
          chainName: chain.name,
          nativeCurrency: {
            name: chain.nativeCurrency.name,
            symbol: chain.nativeCurrency.symbol,
            decimals: chain.nativeCurrency.decimals,
          },
          rpcUrls: chain.rpcUrls.default.http,
          blockExplorerUrls: null,
        },
      ];

      await ethereum.request({ method: 'wallet_addEthereumChain', params });
    } else {
      console.error('Ethereum object does not exist on window, or does not have a request method.');
    }
  }, []);

  return { addNetwork };
};

export { useAddNetwork };
