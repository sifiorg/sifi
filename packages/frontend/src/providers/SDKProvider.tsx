import LIFI from '@lifi/sdk';
import { createContext, useContext, useMemo } from 'react';
import { apiUrl } from '../utils';

let lifi: LIFI;

const SDKContext = createContext<LIFI>(new LIFI());

const useLiFi = (): LIFI => useContext(SDKContext);

const SDKProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const value = useMemo(() => {
    if (!lifi) {
      lifi = new LIFI({
        apiUrl: `${apiUrl}/lifi/`,
      });
    }

    return lifi;
  }, []);

  return <SDKContext.Provider value={value}>{children}</SDKContext.Provider>;
};

export { SDKProvider, useLiFi };
