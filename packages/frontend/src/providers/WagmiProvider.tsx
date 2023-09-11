import type { FC, PropsWithChildren } from 'react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { connectors } from 'src/connectors';

const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  connectors: Object.values(connectors),
  publicClient,
  webSocketPublicClient,
});

const WagmiProvider: FC<PropsWithChildren> = ({ children }) => (
  <WagmiConfig config={config}>{children}</WagmiConfig>
);

export { WagmiProvider };
