import ethereumIcon from '../assets/chain-icons/ethereum.svg';
import arbitrumIcon from '../assets/chain-icons/arbitrum.svg';
import polygonIcon from '../assets/chain-icons/polygon.svg';
import optimismIcon from '../assets/chain-icons/optimism.svg';
import defaultIcon from '../assets/chain-icons/default-chain.svg';
import { mainnet, polygon, optimism, arbitrum, sepolia, Chain } from 'viem/chains';
import { isTest } from './environments';

const PRODUCTION_CHAINS: Chain[] = [
  // The order in which the chains are displayed in the UI
  mainnet,
  arbitrum,
  optimism,
  polygon
];

const TEST_CHAINS: Chain[] = [
  sepolia
];

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
    default:
      return defaultIcon;
  }
}

export { SUPPORTED_CHAINS, getChainIcon };
