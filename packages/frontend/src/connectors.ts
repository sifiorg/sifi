import { configureChains } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

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

const walletConnectConnector = new WalletConnectLegacyConnector({
  chains,
  options: {
    qrcode: true,
  },
});

const connectors = {
  injected: injectedConnector,
  coinbaseWallet: coinbaseWalletConnector,
  walletConnect: walletConnectConnector,
};

export { connectors, type SupportedWallet };
