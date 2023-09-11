import { createWalletClient, http } from 'viem';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { privateKeyToAccount } from 'viem/accounts' 
import { mainnet } from 'wagmi/chains';
import { MockConnector } from 'wagmi/connectors/mock';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const mainnetRpcUrl = 'https://eth-rpc.gateway.pokt.network/';

const MOCK_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const account = privateKeyToAccount(MOCK_PRIVATE_KEY);

const demoWalletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
  account,
});

const { chains, publicClient } = configureChains(
  [mainnet],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: mainnetRpcUrl,
      }),
    }),
  ]
);

const mockWagmiConfig = (walletClient, mockOptions = {}) =>
  createConfig({
    autoConnect: true,
    publicClient,
    connectors: [
      new MockConnector({
        chains,
        options: {
          walletClient,
          chainId: 1,
          ...mockOptions,
        },
      }),
    ],
  });

const MockWagmiDecorator =
  (walletClient = demoWalletClient) =>
    Story => {
      return (
        <WagmiConfig config={mockWagmiConfig(walletClient)}>
          <Story />
        </WagmiConfig>
      );
    };

export { MockWagmiDecorator };
