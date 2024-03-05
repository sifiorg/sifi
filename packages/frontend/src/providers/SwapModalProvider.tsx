import { Quote } from '@sifi/sdk';
import React, { createContext, useState } from 'react';
import { SwapModal } from 'src/modals/SwapModal/SwapModal';

type SwapModalContextType = {
  quote: Quote | null;
  hash: `0x${string}` | null;
  setHash: (hash: `0x${string}` | null) => void;
  isSwapModalOpen: boolean;
  openSwapModal: (quote: Quote, hash?: `0x${string}`) => void;
  closeSwapModal: () => void;
};

const defaultContextValue: SwapModalContextType = {
  quote: null,
  hash: null,
  setHash: () => {},
  isSwapModalOpen: false,
  openSwapModal: () => {},
  closeSwapModal: () => {},
};

const SwapModalContext = createContext<SwapModalContextType>(defaultContextValue);

const SwapModalProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);

  const openModal = (quote: Quote, hash?: `0x${string}`) => {
    setQuote(quote);
    setIsOpen(true);
    hash && setHash(hash);
  };

  const closeModal = () => {
    setIsOpen(false);
    setQuote(null);
    setHash(null);
  };

  return (
    <SwapModalContext.Provider
      value={{
        quote,
        hash,
        setHash,
        openSwapModal: openModal,
        closeSwapModal: closeModal,
        isSwapModalOpen: isOpen,
      }}
    >
      {children}
      {quote && (
        <SwapModal isOpen={isOpen} closeModal={closeModal} quote={quote} hash={hash || undefined} />
      )}
    </SwapModalContext.Provider>
  );
};

export { SwapModalProvider, SwapModalContext };
