import '@nomicfoundation/hardhat-foundry';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/types';
import './tasks/grantTransferRole';
import './tasks/keypair';

dotenv.config({ path: '../../.env' });

const { MAINNET_RPC_URL, ETHERSCAN_API_KEY, EVM_MNEMONIC, SEPOLIA_RPC_URL, DEV_MNEMONIC } =
  process.env;

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
      url: MAINNET_RPC_URL ?? 'https://mainnet.infura.io/v3/',
      accounts: { mnemonic: '' },
    },
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL || '',
      accounts: { mnemonic: '' },
      chainId: 11155111,
      gasMultiplier: 2,
    },
  },
  etherscan: {},
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
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
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
}

if (DEV_MNEMONIC) {
  config.networks.hardhat = {
    ...config.networks.hardhat,
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
