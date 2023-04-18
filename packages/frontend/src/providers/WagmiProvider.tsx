import type { FC, PropsWithChildren } from 'react';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { connectors } from '../connectors';

const { provider, webSocketProvider } = configureChains([mainnet, polygon], [publicProvider()]);

const client = createClient({
  autoConnect: true,
  connectors: Object.values(connectors),
  provider,
  webSocketProvider,
});

const WagmiProvider: FC<PropsWithChildren> = ({ children }) => (
  <WagmiConfig client={client}>{children}</WagmiConfig>
);

export { WagmiProvider };
