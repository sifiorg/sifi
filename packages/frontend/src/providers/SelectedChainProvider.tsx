import React, { createContext, useState, useContext } from 'react';
import { Chain } from 'wagmi';
import { SUPPORTED_CHAINS } from '../utils/evm';

type SelectedChainContextType = {
  selectedChain: Chain & { icon: string };
  setSelectedChain: React.Dispatch<React.SetStateAction<Chain & { icon: string }>>;
};

const SelectedChainContext = createContext<SelectedChainContextType | undefined>(undefined);

const SelectedChainProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS.ethereum);

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
