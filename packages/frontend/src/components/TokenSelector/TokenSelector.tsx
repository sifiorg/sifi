import { FunctionComponent, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useFormContext } from 'react-hook-form';
import { CoinSelector } from '@sifi/shared-ui';
import { SwapFormKeyHelper, SwapFormType } from 'src/providers/SwapFormProvider';
import { useTokens } from 'src/hooks/useTokens';
import { getTokenBySymbol } from 'src/utils';
import type { BalanceMap } from 'src/types';

const TokenSelector: FunctionComponent<{
  close: () => void;
  isOpen: boolean;
  type: SwapFormType;
  balanceMap: BalanceMap | null;
}> = ({ isOpen, close, type, balanceMap }) => {
  const selectId = SwapFormKeyHelper.getTokenKey(type);
  const { address } = useAccount();
  const { fromTokens, toTokens, fetchFromTokenByAddress, fetchToTokenByAddress } = useTokens();
  const tokens = type === 'from' ? fromTokens : toTokens;
  const fetchTokenByAddress = type === 'from' ? fetchFromTokenByAddress : fetchToTokenByAddress;
  const { setValue, watch } = useFormContext();
  const selectedToken = getTokenBySymbol(watch(selectId), tokens);

  const handleSelectToken = (newTokenAddress: `0x${string}`) => {
    const newToken = tokens?.find(token => token.address === newTokenAddress);
    if (!newToken) return;

    setValue(selectId, newToken.symbol);
  };

  const formattedTokens = useMemo(() => {
    return tokens?.map(token => {
      const balance =
        balanceMap?.get(token.address.toLowerCase() as `0x${string}`)?.toString() || undefined;
      return {
        id: token.address as `0x${string}`,
        logoURI: token.logoURI,
        name: token.name,
        networkDisplayName: null,
        symbol: token.symbol,
        networkLogoURI: null,
        balance,
      };
    });
  }, [tokens, balanceMap, address]);

  if (!formattedTokens) return null;

  const title = { from: 'You pay', to: 'You receive' } as const;

  return (
    <CoinSelector
      options={formattedTokens}
      isOpen={isOpen}
      onClose={close}
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      onSelect={tokenId => handleSelectToken(tokenId as `0x${string}`)}
      onTokenAddressInput={fetchTokenByAddress}
      selected={selectedToken?.address}
      title={title[type]}
    />
  );
};

export { TokenSelector };
