import { Wallet } from 'ethers';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { MockConnector } from '@wagmi/core/connectors/mock';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const mainnetRpcUrl = 'https://eth-rpc.gateway.pokt.network/';
const demoWallet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

const { chains, provider } = configureChains(
  [mainnet],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: mainnetRpcUrl,
      }),
    }),
  ]
);

const mockWagmiClient = (wallet, mockOptions = {}) =>
  createClient({
    autoConnect: true,
    provider,
    connectors: [
      new MockConnector({
        chains,
        options: {
          signer: wallet,
          chainId: 1,
          ...mockOptions,
        },
      }),
    ],
  });

const MockWagmiDecorator =
  (wallet = demoWallet) =>
  Story => {
    return (
      <WagmiConfig client={mockWagmiClient(wallet)}>
        <Story />
      </WagmiConfig>
    );
  };

export { MockWagmiDecorator };
