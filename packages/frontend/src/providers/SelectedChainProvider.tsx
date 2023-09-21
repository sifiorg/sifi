import React, { createContext, useState, useContext } from 'react';
import { Chain, mainnet } from 'wagmi';

type SelectedChainContextType = {
  selectedChain: Chain;
  setSelectedChain: React.Dispatch<React.SetStateAction<Chain>>;
};

const SelectedChainContext = createContext<SelectedChainContextType | undefined>(undefined);

const SelectedChainProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [selectedChain, setSelectedChain] = useState(mainnet);

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
