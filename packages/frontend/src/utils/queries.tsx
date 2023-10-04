import { type Token } from "@sifi/sdk";

export const getQueryKey = (
  primaryKey: string,
  fromAmount?: string,
  fromToken?: Token | null,
  toToken?: Token | null,
) => [
  primaryKey, {
    fromAmount,
    toTokenAddress: toToken?.address,
    fromTokenAddress: fromToken?.address,
    toChainId: toToken?.chainId,
    fromChainId: fromToken?.chainId,
  }
];
