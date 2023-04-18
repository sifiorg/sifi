export const getQueryKey = (
  primaryKey: string,
  fromAmount?: string,
  toTokenAddress?: string,
  fromTokenAddress?: string
) => [primaryKey, { fromAmount, toTokenAddress, fromTokenAddress }];
