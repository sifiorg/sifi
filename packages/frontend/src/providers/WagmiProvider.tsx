import type { FC, PropsWithChildren } from 'react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { connectors } from 'src/connectors';
import { SUPPORTED_CHAINS } from 'src/utils/chains';

const { publicClient, webSocketPublicClient } = configureChains(SUPPORTED_CHAINS, [
  publicProvider(),
]);

const config = createConfig({
  autoConnect: false,
  connectors: Object.values(connectors),
  publicClient,
  webSocketPublicClient,
});

const WagmiProvider: FC<PropsWithChildren> = ({ children }) => (
  <WagmiConfig config={config}>{children}</WagmiConfig>
);

export { WagmiProvider };
