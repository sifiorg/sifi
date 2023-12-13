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
// Temporary until shared-ui can e updated to latest
import { ToastContainer } from 'react-toastify';

const toastContainerOptions: ToastContainerProps = {
  autoClose: 10000,
  bodyClassName: 'p-0',
  closeButton: false,
  hideProgressBar: true,
  pauseOnHover: true,
  // position: toast.POSITION.BOTTOM_RIGHT,
  style: { width: 'auto' },
  toastClassName: 'text-flashbang-white mb-0 text-center font-text border-0 min-w-100',
  className: 'flex flex-col items-end gap-2',
};

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
                  <SpaceTravelProvider>{children}</SpaceTravelProvider>
                  <ToastContainer {...toastContainerOptions} />
                  <CustomToastContainer />
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
