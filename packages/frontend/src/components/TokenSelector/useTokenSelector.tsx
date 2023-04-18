import { useState } from 'react';
import { SwapFormType } from '../../providers/SwapFormProvider';

const useTokenSelector = () => {
  const [tokenSelectorType, setTokenSelectorType] = useState<SwapFormType>('from');

  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);

  const openTokenSelector = (type: SwapFormType) => {
    setTokenSelectorType(type);
    setIsTokenSelectorOpen(true);
  };

  const closeTokenSelector = () => setIsTokenSelectorOpen(false);

  return { closeTokenSelector, openTokenSelector, tokenSelectorType, isTokenSelectorOpen };
};

export { useTokenSelector };
