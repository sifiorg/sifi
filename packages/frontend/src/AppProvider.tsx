// eslint-disable-next-line import/no-extraneous-dependencies
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';
import { HashRouter } from 'react-router-dom';
import { CustomToastContainer } from '@sifi/shared-ui';
import { AnalyticsProvider } from './hooks/useAnalytics';
import { SDKProvider } from './providers/SDKProvider';
import { SwapFormProvider } from './providers/SwapFormProvider';
import { WagmiProvider } from './providers/WagmiProvider';
import { TokensProvider } from './providers/TokensProvider';
import { SpaceTravelProvider } from './providers/SpaceTravelProvider';
import { SwapHistoryProvider } from './providers/SwapHistoryProvider';
import { ReferralModalProvider } from './providers/ReferralModalProvider';
import { WalletBalancesProvider } from './providers/WalletBalancesProvider';
import { SwapModalProvider } from './providers/SwapModalProvider';

const QueryProvider = QueryClientProvider;
const queryClient = new QueryClient();

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <HashRouter>
      <QueryProvider client={queryClient}>
        <AnalyticsProvider>
          <SDKProvider>
            <WagmiProvider>
              <SwapFormProvider>
                <TokensProvider>
                  <WalletBalancesProvider>
                    <SwapModalProvider>
                      <SwapHistoryProvider>
                        <ReferralModalProvider>
                          <SpaceTravelProvider>{children}</SpaceTravelProvider>
                          <CustomToastContainer />
                        </ReferralModalProvider>
                      </SwapHistoryProvider>
                    </SwapModalProvider>
                  </WalletBalancesProvider>
                </TokensProvider>
              </SwapFormProvider>
            </WagmiProvider>
          </SDKProvider>
        </AnalyticsProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryProvider>
    </HashRouter>
  );
};
