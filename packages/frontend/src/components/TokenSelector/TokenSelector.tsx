import { FunctionComponent, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useFormContext } from 'react-hook-form';
import { CoinSelector } from '@sifi/shared-ui';
import { SwapFormKeyHelper, SwapFormType } from 'src/providers/SwapFormProvider';
import { useTokens } from 'src/hooks/useTokens';
import { formatTokenAmount, getTokenBySymbol } from 'src/utils';
import { useWalletBalance } from 'src/hooks/useWalletBalance';
import { useMultiCallTokenBalance } from 'src/hooks/useMulticallTokenBalance';
import type { MulticallToken } from 'src/types';

const TokenSelector: FunctionComponent<{
  close: () => void;
  isOpen: boolean;
  type: SwapFormType;
}> = ({ isOpen, close, type }) => {
  const selectId = SwapFormKeyHelper.getTokenKey(type);
  const { address } = useAccount();
  const { tokens, fetchTokenByAddress } = useTokens();
  const { setValue, watch } = useFormContext();
  const selectedToken = getTokenBySymbol(watch(selectId), tokens);
  const { data: walletBalanceData } = useWalletBalance();
  const balanceMap = useMultiCallTokenBalance(tokens as MulticallToken[]);

  const handleSelectToken = (newTokenAddress: `0x${string}`) => {
    const newToken = tokens?.find(token => token.address === newTokenAddress);
    if (!newToken) return;

    setValue(selectId, newToken.symbol);
  };

  const formattedTokens = useMemo(
    () =>
      tokens?.map(token => {
        const balance = balanceMap?.get(token.address.toLowerCase() as `0x${string}`)?.toString() || undefined;
        return {
          id: token.address as `0x${string}`,
          logoURI: token.logoURI,
          name: token.name,
          networkDisplayName: null,
          symbol: token.symbol,
          networkLogoURI: null,
          balance,
        }}),
    [tokens, walletBalanceData, address]
  );

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
