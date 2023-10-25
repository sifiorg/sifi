import { FormProvider, useForm } from 'react-hook-form';
import { SUPPORTED_CHAINS } from 'src/utils/chains';
import { Chain } from 'viem';

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
  [SwapFormKey.FromChain]: Chain;
  [SwapFormKey.FromToken]: string;
  [SwapFormKey.ToAmount]: string;
  [SwapFormKey.ToAddress]: string;
  [SwapFormKey.ToChain]: Chain;
  [SwapFormKey.ToToken]: string;
  [SwapFormKey.TokenSearchFilter]: string;
};

export type SwapFormType = 'from' | 'to';

export const formDefaultValues = {
  [SwapFormKey.FromAmount]: '',
  [SwapFormKey.FromChain]: SUPPORTED_CHAINS[0], // Mainnet
  [SwapFormKey.FromToken]: null,
  [SwapFormKey.ToAmount]: '',
  [SwapFormKey.ToAddress]: '',
  [SwapFormKey.ToChain]: SUPPORTED_CHAINS[1], // Arbitrum
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
