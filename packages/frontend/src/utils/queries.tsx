import { type Token } from '@sifi/sdk';

export const getQueryKey = (
  primaryKey: string,
  fromAmount?: string,
  fromToken?: Token | null,
  toToken?: Token | null
) => [
  primaryKey,
  fromAmount,
  `${toToken?.address}${toToken?.chainId}`,
  `${fromToken?.address}${fromToken?.chainId}`,
];
