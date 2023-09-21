import ethereumIcon from '../assets/chain-icons/ethereum.svg';
import arbitrumIcon from '../assets/chain-icons/arbitrum.svg';
import polygonIcon from '../assets/chain-icons/polygon.svg';
import optimismIcon from '../assets/chain-icons/optimism.svg';
import { mainnet, polygon, optimism, arbitrum, Chain } from 'viem/chains';

const SUPPORTED_CHAINS: Chain[] = [
  // The order in which the chains are displayed in the UI
  mainnet,
  arbitrum,
  optimism,
  polygon,
];

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
      return '';
  }
}

export { SUPPORTED_CHAINS, getChainIcon };
