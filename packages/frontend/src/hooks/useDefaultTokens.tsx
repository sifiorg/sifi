import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTokens } from 'src/hooks/useTokens';
import { SwapFormKeyHelper } from 'src/providers/SwapFormProvider';

const DEFAULT_TO_TOKEN_SYMBOL = 'USDC';

const useDefaultTokens = () => {
  const { setValue } = useFormContext();
  const fromTokenKey = SwapFormKeyHelper.getTokenKey('from');
  const toTokenKey = SwapFormKeyHelper.getTokenKey('to');
  const { fromTokens, toTokens } = useTokens();

  useEffect(() => {
    if (fromTokens.length > 1) {
      setValue(fromTokenKey, fromTokens[0].symbol);
    }
  }, [fromTokens, setValue]);

  useEffect(() => {
    if (toTokens.length > 1) {
      setValue(toTokenKey, DEFAULT_TO_TOKEN_SYMBOL);
    }
  }, [toTokens, setValue]);
};

export { useDefaultTokens };
