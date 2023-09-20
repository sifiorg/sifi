import React, { createContext, useState, useContext } from 'react';
import { SUPPORTED_CHAINS } from 'src/utils/chains';
import { Chain } from 'wagmi';

type SelectedChain = Chain & { icon: string };

type SelectedChainContextType = {
  selectedChain: SelectedChain;
  setSelectedChain: React.Dispatch<React.SetStateAction<SelectedChain>>;
};

const SelectedChainContext = createContext<SelectedChainContextType | undefined>(undefined);

const SelectedChainProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS.mainnet);

  return (
    <SelectedChainContext.Provider value={{ selectedChain, setSelectedChain }}>
      {children}
    </SelectedChainContext.Provider>
  );
};

const useSelectedChain = (): SelectedChainContextType => {
  const context = useContext(SelectedChainContext);
  if (!context) {
    throw new Error('useSelectedChain must be used within a SelectedChainProvider');
  }
  return context;
};

export { SelectedChainProvider, useSelectedChain };
export type { SelectedChain };
