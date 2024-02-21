import { Chain } from 'viem';
import { getChainById } from 'src/utils/chains';

const getEvmTxUrl = (chain: Chain, txid: string): string | undefined => {
  return chain.blockExplorers?.default
    ? `${chain.blockExplorers?.default.url}/tx/${txid}`
    : undefined;
};

const getSwapExplorerLink = (
  fromChainId: number,
  toChainId: number,
  hash: `0x${string}`
): string | undefined => {
  const isJump = fromChainId !== toChainId;
  const fromChain = getChainById(fromChainId);

  if (isJump) {
    return `https://layerzeroscan.com/tx/${hash}`;
  } else {
    return getEvmTxUrl(fromChain, hash);
  }
};

export { getEvmTxUrl, getSwapExplorerLink };
