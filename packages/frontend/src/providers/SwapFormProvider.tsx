import { FormProvider, useForm } from 'react-hook-form';

export enum SwapFormKey {
  FromAmount = 'fromAmount',
  FromChain = 'fromChain',
  FromToken = 'fromToken',
  ToAddress = 'toAddress',
  ToAmount = 'toAmount',
  ToChain = 'toChain',
  ToToken = 'toToken',
  TokenSearchFilter = 'tokenSearchFilter',
}

export type SwapFormValues = {
  [SwapFormKey.FromAmount]: string;
  [SwapFormKey.FromChain]: number;
  [SwapFormKey.FromToken]: string;
  [SwapFormKey.ToAmount]: string;
  [SwapFormKey.ToAddress]: string;
  [SwapFormKey.ToChain]: number;
  [SwapFormKey.ToToken]: string;
  [SwapFormKey.TokenSearchFilter]: string;
};

export type SwapFormType = 'from' | 'to';

export const formDefaultValues = {
  [SwapFormKey.FromAmount]: '',
  [SwapFormKey.FromChain]: 1, // Temporarily restricted ot ETH chain
  [SwapFormKey.FromToken]: null,
  [SwapFormKey.ToAmount]: '',
  [SwapFormKey.ToAddress]: '',
  [SwapFormKey.ToChain]: 1, // Temporarily restricted ot ETH chain;
  [SwapFormKey.ToToken]: null,
  [SwapFormKey.TokenSearchFilter]: '',
};

export const SwapFormKeyHelper = {
  getChainKey: (formType: SwapFormType): 'fromChain' | 'toChain' => `${formType}Chain`,
  getTokenKey: (formType: SwapFormType): 'fromToken' | 'toToken' => `${formType}Token`,
  getAmountKey: (formType: SwapFormType): 'fromAmount' | 'toAmount' => `${formType}Amount`,
};

export const SwapFormProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      ...formDefaultValues,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
