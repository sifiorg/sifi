// eslint-disable-next-line import/no-extraneous-dependencies
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CustomToastContainer } from '@sifi/shared-ui';
import { AnalyticsProvider } from './hooks/useAnalytics';
import { SDKProvider } from './providers/SDKProvider';
import { SwapFormProvider } from './providers/SwapFormProvider';
import { WagmiProvider } from './providers/WagmiProvider';
import { TokensProvider } from './providers/TokensProvider';
import { SpaceTravelProvider } from './providers/SpaceTravelProvider';
import { SwapHistoryProvider } from './providers/SwapHistoryProvider';

const QueryProvider = QueryClientProvider;
const queryClient = new QueryClient();

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BrowserRouter>
      <QueryProvider client={queryClient}>
        <AnalyticsProvider>
          <SDKProvider>
            <WagmiProvider>
              <SwapFormProvider>
                <TokensProvider>
                  <SwapHistoryProvider>
                    <SpaceTravelProvider>{children}</SpaceTravelProvider>
                    <CustomToastContainer />
                  </SwapHistoryProvider>
                </TokensProvider>
              </SwapFormProvider>
            </WagmiProvider>
          </SDKProvider>
        </AnalyticsProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryProvider>
    </BrowserRouter>
  );
};
