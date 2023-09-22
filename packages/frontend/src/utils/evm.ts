import { Chain } from 'viem';

const getEvmTxUrl = (chain: Chain, txid: string): string | undefined => {
  return chain.blockExplorers?.default
    ? `${chain.blockExplorers?.default.url}/tx/${txid}`
    : undefined;
};

export { getEvmTxUrl };
