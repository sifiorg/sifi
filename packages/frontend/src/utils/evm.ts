import EthereumIcon from '../assets/chain-icons/ethereum.svg';
import ArbitrumIcon from '../assets/chain-icons/arbitrum.svg';
import PolygonIcon from '../assets/chain-icons/polygon.svg';
import OptimismIcon from '../assets/chain-icons/optimism.svg';
import type { Chain } from 'wagmi';

const SUPPORTED_CHAINS: { [network: string]: Chain & { icon: string } } = {
  ethereum: {
    id: 1,
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    name: 'Ethereum',
    network: 'ethereum',
    rpcUrls: {
      default: { http: ['https://eth-rpc.gateway.pokt.network'] },
      public: { http: ['https://eth-rpc.gateway.pokt.network'] },
    },
    icon: EthereumIcon,
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    network: 'polygon',
    nativeCurrency: {
      decimals: 18,
      name: 'MATIC',
      symbol: 'MATIC',
    },
    rpcUrls: {
      default: { http: ['https://polygon-rpc.com/'] },
      public: { http: ['https://polygon-rpc.com/'] },
    },
    icon: PolygonIcon,
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    network: 'arbitrum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://rpc.ankr.com/arbitrum'] },
      public: { http: ['https://rpc.ankr.com/arbitrum'] },
    },
    icon: ArbitrumIcon,
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    network: 'optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['https://mainnet.optimism.io'] },
      public: { http: ['https://mainnet.optimism.io'] },
    },
    icon: OptimismIcon,
  },
};

const getEvmTxUrl = (network: string, txid: string): string | undefined => {
  switch (network) {
    case 'ethereum':
      return `https://etherscan.io/tx/${txid}`;
    case 'avax':
      return `https://snowtrace.io/tx/${txid}`;
    case 'bsc':
      return `https://bscscan.com/tx/${txid}`;
    case 'polygon':
      return `https://polygonscan.com/tx/${txid}`;
    case 'etc':
      return `http://gastracker.io/tx/${txid}`;
    case 'fantom':
      return `https://ftmscan.com/tx/${txid}`;
    case 'arbitrum':
      return `https://arbiscan.io/tx/${txid}`;
    case 'optimism':
      return `https://optimistic.etherscan.io/tx/${txid}`;
    case 'smartbch':
      return `https://smartscan.cash/transaction/${txid}`;
    case 'cronos':
      return `https://cronoscan.com/tx/${txid}`;
    case 'arbitrumnova':
      return `https://nova.arbiscan.io/tx/${txid}`;
    case 'zksyncera':
      return `https://explorer.zksync.io/tx/${txid}`;
    default:
      return undefined;
  }
};

export { getEvmTxUrl, SUPPORTED_CHAINS };
