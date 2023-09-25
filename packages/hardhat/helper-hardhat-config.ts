import { network } from 'hardhat';
import { Network } from 'hardhat/types';
export interface NetworkConfig {
  isDev: boolean;
  wethAddress?: string;
  uniV2RouterAddress?: string;
  blockConfirmations?: number;
}

export const NETWORK_CONFIGS: Partial<Record<string, NetworkConfig>> = {
  localhost: {
    isDev: true,
    blockConfirmations: 1,
  },
  hardhat: {
    isDev: true,
    wethAddress: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    uniV2RouterAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // wrong but ok for deployment testing
    blockConfirmations: 1,
  },
  goerli: {
    isDev: true,
    blockConfirmations: 6,
  },
  sepolia: {
    isDev: true,
    wethAddress: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    uniV2RouterAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // wrong but ok for deployment testing
    blockConfirmations: 6,
  },
  mainnet: {
    isDev: false,
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    uniV2RouterAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    blockConfirmations: 12,
  },
};

export function getNetwork(name = network.name): Network & NetworkConfig {
  const networkConfig = NETWORK_CONFIGS[name];

  if (!networkConfig) {
    throw new Error(`No config found for network ${name}`);
  }

  return { ...network, ...networkConfig };
}
