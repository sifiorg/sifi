import { getChainIcon } from 'src/utils/chains';
import { Chain } from 'viem';
import { Token } from '@sifi/sdk';

const getTokenWithNetwork = (token: Token | undefined, chain: Chain) =>
  token
    ? {
        ...token,
        network:
          { logoURI: getChainIcon(chain.id), name: `${chain.name} network icon` } || undefined,
      }
    : undefined;

export { getTokenWithNetwork };
