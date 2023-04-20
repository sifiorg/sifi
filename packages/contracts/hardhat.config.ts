import type { HardhatUserConfig } from 'hardhat/config';

import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-gas-reporter';
import '@nomiclabs/hardhat-etherscan';
import * as dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
};

// NOTE: This is the private key shared publicly from the Mastering Ethereum book
const MASTERING_ETHEREUM_PRIVATE_KEY =
  'f8f8a2f43c8376ccb0871305060d7b27b0554d2cc72bccf41b2705608452f315';
const account = process.env.PRIVATE_KEY_TEST || MASTERING_ETHEREUM_PRIVATE_KEY;

module.exports = {
  solidity: '0.8.9',
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000000,
    },
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL || 'https://eth.llamarpc.com',
      accounts: [account],
    },
    hardhat: {
      network: {
        timeout: 10000,
      },
      forking: {
        // Mainnet fork
        url: process.env.MAINNET_RPC_URL || 'https://eth.llamarpc.com',
        blockNumber: 16663728,

        // // Polygon fork
        // url: process.env.POLYGON_RPC_URL,
        // blockNumber: 33910000

        // // Optimism Fork
        // url: process.env.OPTIMISM_RPC_URL,
        // blockNumber: 27514768

        // Binance Fork
        // url: process.env.BSC_RPC_URL,
        // blockNumber: 22370092

        // // Avalanche fork
        // url: process.env.AVALANCHE_RPC_URL,
        // blockNumber: 21524070

        // // Fantom fork
        // url: process.env.FANTOM_RPC_URL,
        // blockNumber: 50020614

        // // Cronos fork
        // url: process.env.CRONOS_RPC_URL,
        // blockNumber: 5266690

        // // Arbitrum fork
        // url: process.env.ARBITRUM_RPC_URL,
        // blockNumber: 28252985,
        // ignoreUnknownTxType: true
      },
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || '',
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || '',
  },
  mocha: {
    timeout: 100000000,
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
};
