import { useState } from 'react';
import { useConnect } from 'wagmi';
import { connectors, type SupportedWallet } from 'src/connectors';
import useAnalytics from './useAnalytics';

// TODO(bill): export types from shared-ui, import here

const useConnectWallet = () => {
  const { logEvent } = useAnalytics();
  const [error, setError] = useState<Error | null>(null);

  const { connect: connectInjected, isLoading: injectedIsConnecting } = useConnect({
    connector: connectors.injected,
  });
  const { connect: connectWalletConnect, isLoading: walletConnectIsConnecting } = useConnect({
    connector: connectors.walletConnect,
  });
  const { connect: connectCoinbaseWallet, isLoading: coinbaseIsConnecting } = useConnect({
    connector: connectors.coinbaseWallet,
  });

  const isLoading = injectedIsConnecting || walletConnectIsConnecting || coinbaseIsConnecting;

  const connectWallet = (wallet: SupportedWallet) => {
    setError(null);
    try {
      switch (wallet) {
        case 'metamask':
          connectInjected();
          logEvent('ONMZZFEX');
          break;
        case 'coinbase':
          connectCoinbaseWallet();
          logEvent('ZZXZEDNI');
          break;
        case 'walletconnect':
          connectWalletConnect();
          logEvent('PZUITG5Z');
          break;
        default:
          connectInjected();
          logEvent('ONMZZFEX');
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      setError(e as Error);
    }
  };

  return {
    connectWallet,
    isLoading,
    error,
  };
};

export default useConnectWallet;
