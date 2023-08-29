import { FunctionComponent, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useFormContext } from 'react-hook-form';
import { CoinSelector } from '@sifi/shared-ui';
import { SwapFormKeyHelper, SwapFormType } from 'src/providers/SwapFormProvider';
import { useTokens } from 'src/hooks/useTokens';
import { formatTokenAmount, getTokenBySymbol } from 'src/utils';
import { useWalletBalance } from 'src/hooks/useWalletBalance';
import { useMultiTokenBalances } from 'src/hooks/useMultiTokenBalances';

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

  const balances = useMultiTokenBalances(
    address || '',
    tokens,
    // tokens.map(token => token.address),
    1
  );

  useEffect(() => {
    console.log('balances', balances);
  }, [tokens]);

  const handleSelectToken = (newTokenAddress: `0x${string}`) => {
    const newToken = tokens?.find(token => token.address === newTokenAddress);
    if (!newToken) return;

    setValue(selectId, newToken.symbol);
  };

  const formattedTokens = useMemo(
    () =>
      tokens?.map(token => {
        const tokenBalance = balances?.find(balance => balance.address === token.address);

        return {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          id: token.address as `0x${string}`,
          logoURI: token.logoURI,
          name: token.name,
          networkDisplayName: null,
          symbol: token.symbol,
          networkLogoURI: null,
          balance: Boolean(address) ? tokenBalance?.balance : undefined,
        };
      }),
    [tokens, walletBalanceData, address, balances]
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
