import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};

module.exports = {
  solidity: "0.8.9",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000000,
    },
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY_TEST],
    },
    hardhat: {
      forking: {
        // Mainnet fork
        url: process.env.MAINNET_RPC_URL,
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
      mainnet: process.env.ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  mocha: {
    timeout: 100000000,
  },
};
