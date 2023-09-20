import EthereumIcon from '../assets/chain-icons/ethereum.svg';
import ArbitrumIcon from '../assets/chain-icons/arbitrum.svg';
import PolygonIcon from '../assets/chain-icons/polygon.svg';
import OptimismIcon from '../assets/chain-icons/optimism.svg';
import { mainnet, polygon, optimism, arbitrum } from 'viem/chains';
import type { Chain } from 'wagmi';

const SUPPORTED_CHAINS: { [network: string]: Chain & { icon: string } } = {
  mainnet: { ...mainnet, icon: EthereumIcon },
  arbitrum: { ...arbitrum, icon: ArbitrumIcon },
  optimism: { ...optimism, icon: OptimismIcon },
  polygon: { ...polygon, icon: PolygonIcon },
};

export { SUPPORTED_CHAINS };
