import { useContext } from 'react';
import { SwapModalContext } from 'src/providers/SwapModalProvider';

const useSwapModal = () => {
  const context = useContext(SwapModalContext);
  if (!context) {
    throw new Error('useSwapModal must be used within a SwapModalProvider');
  }
  return context;
};

export { useSwapModal };
