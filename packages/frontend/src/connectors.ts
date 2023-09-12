import { configureChains } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { walletConnectProjectId } from './config';


type SupportedWallet = 'injected' | 'coinbase' | 'walletconnect';

const { chains } = configureChains([mainnet, polygon], [publicProvider()]);

const injectedConnector = new InjectedConnector({ chains });

const coinbaseWalletConnector = new CoinbaseWalletConnector({
  chains,
  options: {
    appName: 'Sideshift.fi',
    jsonRpcUrl: 'https://eth-rpc.gateway.pokt.network',
  },
});

const walletConnectConnector = new WalletConnectConnector({
  chains,
  options: {
    showQrModal: true,
    projectId: walletConnectProjectId,
  },
});

const connectors = {
  injected: injectedConnector,
  coinbaseWallet: coinbaseWalletConnector,
  walletConnect: walletConnectConnector,
};

export { connectors, type SupportedWallet };
