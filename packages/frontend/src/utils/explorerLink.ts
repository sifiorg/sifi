import { Chain } from 'viem';

const getEvmTxUrl = (chain: Chain, txid: string): string | undefined => {
  return chain.blockExplorers?.default
    ? `${chain.blockExplorers?.default.url}/tx/${txid}`
    : undefined;
};

const getSwapExplorerLink = (
  fromChain: Chain,
  toChain: Chain,
  hash: `0x${string}`
): string | undefined => {
  const isJump = fromChain.id !== toChain.id;

  if (isJump) {
    return `https://layerzeroscan.com/tx/${hash}`;
  } else {
    return getEvmTxUrl(fromChain, hash);
  }
};

export { getEvmTxUrl, getSwapExplorerLink };
