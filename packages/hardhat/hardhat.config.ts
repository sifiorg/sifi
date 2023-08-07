import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/types';
import './tasks/deploySpender';
import './tasks/deploySifiV1Router01';
import './tasks/grantTransferRole';

dotenv.config({ path: '../../.env' });

const { RPC_URL, ETHERSCAN_API_KEY, PRIVATE_KEY } = process.env;

const config = {
  solidity: {
    version: '0.8.21',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10_000
      },
    }
  },
  networks: {
    mainnet: {
      url: RPC_URL ?? '	https://mainnet.infura.io/v3/',
      accounts: [] as string[],
    },
    hardhat: {
    },
  },
  etherscan: {
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
  },
} satisfies HardhatUserConfig;

if (ETHERSCAN_API_KEY) {
  config.etherscan = {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
    }
  };
}

if (PRIVATE_KEY) {
  config.networks.mainnet.accounts = [PRIVATE_KEY];
}

if (RPC_URL)  {
  config.networks.hardhat = {
    ...config.networks.hardhat,
    forking: {
      url: RPC_URL,
      blockNumber: 17853419,
    },
  };
}

export default config;
