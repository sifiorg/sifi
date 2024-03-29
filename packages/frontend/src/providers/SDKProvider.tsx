import { Sifi } from '@sifi/sdk';
import { createContext, useContext, useMemo } from 'react';
import { baseUrl } from 'src/utils';

let sifi: Sifi;

const SDKContext = createContext<Sifi>(new Sifi(baseUrl));

const useSifi = (): Sifi => useContext(SDKContext);

const SDKProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // TODO: Add error handling
  const value = useMemo(() => {
    if (!sifi) {
      sifi = new Sifi(baseUrl);
    }

    return sifi;
  }, []);

  return <SDKContext.Provider value={value}>{children}</SDKContext.Provider>;
};

export { SDKProvider, useSifi };
