import ethereumIcon from '../assets/chain-icons/ethereum.svg';
import arbitrumIcon from '../assets/chain-icons/arbitrum.svg';
import polygonIcon from '../assets/chain-icons/polygon.svg';
import optimismIcon from '../assets/chain-icons/optimism.svg';
import defaultIcon from '../assets/chain-icons/default-chain.svg';
import avalancheIcon from '../assets/chain-icons/avax.svg';
import baseIcon from '../assets/chain-icons/base.svg';
import bscIcon from '../assets/chain-icons/bsc.svg';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  sepolia,
  Chain,
  goerli,
  avalanche,
  base,
  bsc,
} from 'viem/chains';
import { isTest } from './environments';

// When adding a new chain, make sure to also add it to `getChainIsByShortName`
const PRODUCTION_CHAINS: Chain[] = [
  // The order in which the chains are displayed in the UI
  mainnet,
  arbitrum,
  {
    ...avalanche,
    blockExplorers: {
      etherscan: {
          name: "Avascan",
          url: "https://avascan.info/blockchain/c",
      },
      default: {
          name: "Avascan",
          url: "https://avascan.info/blockchain/c",
      },
  },
  },
  base,
  {
    ...bsc,
   name: 'BNB Chain'
  },
  optimism,
  polygon,
];

const getChainIdByShortName = (shortName: string): number | null => {
  switch (shortName) {
    case 'eth':
      return mainnet.id;
    case 'arb':
      return arbitrum.id;
    case 'avax':
      return avalanche.id;
    case 'bsc':
      return bsc.id;
    case 'op':
      return optimism.id;
    case 'base':
      return base.id;
    case 'matic':
      return polygon.id;
    default:
      return null;
  }
};

const TEST_CHAINS: Chain[] = [sepolia, goerli];

const SUPPORTED_CHAINS = isTest ? PRODUCTION_CHAINS.concat(TEST_CHAINS) : PRODUCTION_CHAINS;

function getChainIcon(chainId: number) {
  switch (chainId) {
    case mainnet.id:
      return ethereumIcon;
    case arbitrum.id:
      return arbitrumIcon;
    case optimism.id:
      return optimismIcon;
    case polygon.id:
      return polygonIcon;
    case avalanche.id:
      return avalancheIcon;
    case base.id:
      return baseIcon;
    case bsc.id:
      return bscIcon;
    default:
      return defaultIcon;
  }
}

const getChainById = (chainId: number): Chain => {
  const chain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);

  if (!chain) throw new Error(`Chain not found for chainId: ${chainId}`);

  return chain;
};

export { SUPPORTED_CHAINS, getChainIcon, getChainById, getChainIdByShortName };
