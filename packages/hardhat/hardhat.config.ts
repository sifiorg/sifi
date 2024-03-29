import '@nomicfoundation/hardhat-foundry';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/types';
import './tasks/grantTransferRole';
import './tasks/keypair';

dotenv.config({ path: '../../.env' });

const {
  MAINNET_RPC_URL,
  ETHERSCAN_API_KEY,
  EVM_MNEMONIC,
  DEV_MNEMONIC,
  POLYGON_SCAN_API_KEY,
  ARBITRUM_SCAN_API_KEY,
  OPTIMISM_SCAN_API_KEY,
  AVALANCHE_SCAN_API_KEY,
  BASE_SCAN_API_KEY,
  BSC_SCAN_API_KEY,
} = process.env;

function getNetworkUrl(name: string): string {
  if (name === 'mainnet') {
    return MAINNET_RPC_URL ?? 'https://mainnet.infura.io/v3/';
  }

  const envKey = `${name.toUpperCase()}_RPC_URL`;

  if (process.env[envKey]) {
    return process.env[envKey]!;
  }

  // Testnet sepolia is named sepolia. EVM forks are named fork-mainnet
  let infuraNetworkName: string;

  if (name === 'sepolia') {
    infuraNetworkName = name;
  } else if (name === 'optimismGoerli') {
    infuraNetworkName = 'optimism-goerli';
  } else {
    infuraNetworkName = `${name}-mainnet`;
  }

  return getNetworkUrl('mainnet').replace('mainnet', infuraNetworkName);
}

const config = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        // NOTE: SifiDiamons is deployed in production with 1M runs
        runs: 999999,
      },
    },
  },
  networks: {
    mainnet: {
      url: getNetworkUrl('mainnet'),
      accounts: { mnemonic: '' },
    },
    polygon: {
      url: getNetworkUrl('polygon'),
      accounts: { mnemonic: '' },
    },
    arbitrum: {
      url: getNetworkUrl('arbitrum'),
      accounts: { mnemonic: '' },
    },
    optimism: {
      url: getNetworkUrl('optimism'),
      accounts: { mnemonic: '' },
    },
    hardhat: {},
    goerli: {
      url: getNetworkUrl('goerli'),
      accounts: { mnemonic: '' },
      chainId: 5,
      gasMultiplier: 2,
    },
    optimismGoerli: {
      url: getNetworkUrl('optimismGoerli'),
      accounts: { mnemonic: '' },
      chainId: 420,
      gasMultiplier: 10,
    },
    sepolia: {
      url: getNetworkUrl('sepolia'),
      accounts: { mnemonic: '' },
      chainId: 11155111,
      gasMultiplier: 2,
    },
    avalanche: {
      url: getNetworkUrl('avalanche'),
      accounts: { mnemonic: '' },
    },
    base: {
      url: getNetworkUrl('base'),
      accounts: { mnemonic: '' },
    },
    bsc: {
      url: getNetworkUrl('bsc'),
      accounts: { mnemonic: '' },
    },
  },
  etherscan: {
    customChains: [
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://api.basescan.org',
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    defaultDeployer: {
      default: 0,
    },
    deployerSpender: {
      default: 1,
    },
  },
} satisfies HardhatUserConfig;

if (ETHERSCAN_API_KEY) {
  config.etherscan = {
    ...config.etherscan,
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      optimisticEthereum: OPTIMISM_SCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGON_SCAN_API_KEY,
      arbitrumOne: ARBITRUM_SCAN_API_KEY,
      optimisticGoerli: OPTIMISM_SCAN_API_KEY,
      avalanche: AVALANCHE_SCAN_API_KEY,
      base: BASE_SCAN_API_KEY,
      bsc: BSC_SCAN_API_KEY,
    },
  };
}

if (MAINNET_RPC_URL) {
  config.networks.hardhat = {
    ...config.networks.hardhat,
    forking: {
      url: MAINNET_RPC_URL,
      blockNumber: 17853419,
    },
  };
}

if (EVM_MNEMONIC) {
  config.networks.mainnet = { ...config.networks.mainnet, accounts: { mnemonic: EVM_MNEMONIC } };

  config.networks.polygon = { ...config.networks.polygon, accounts: { mnemonic: EVM_MNEMONIC } };

  config.networks.arbitrum = { ...config.networks.arbitrum, accounts: { mnemonic: EVM_MNEMONIC } };

  config.networks.optimism = { ...config.networks.optimism, accounts: { mnemonic: EVM_MNEMONIC } };

  config.networks.avalanche = {
    ...config.networks.avalanche,
    accounts: { mnemonic: EVM_MNEMONIC },
  };

  config.networks.base = {
    ...config.networks.base,
    accounts: { mnemonic: EVM_MNEMONIC },
  };

  config.networks.bsc = {
    ...config.networks.bsc,
    accounts: { mnemonic: EVM_MNEMONIC },
  };
}

if (DEV_MNEMONIC) {
  config.networks.hardhat = {
    ...config.networks.hardhat,
    accounts: {
      mnemonic: DEV_MNEMONIC,
    },
  };

  config.networks.goerli = {
    ...config.networks.goerli,
    accounts: {
      mnemonic: DEV_MNEMONIC,
    },
  };

  config.networks.optimismGoerli = {
    ...config.networks.optimismGoerli,
    accounts: {
      mnemonic: DEV_MNEMONIC,
    },
  };

  config.networks.sepolia = {
    ...config.networks.sepolia,
    accounts: {
      mnemonic: DEV_MNEMONIC,
    },
  };
}

export default config;
