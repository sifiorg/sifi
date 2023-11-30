import { useAccount, useNetwork } from 'wagmi';
import { useSwapFormValues } from './useSwapFormValues';
import { useTokens } from './useTokens';
import { getTokenBySymbol } from 'src/utils';
import { useSpendableBalance } from './useSpendableBalance';

const useDepositMax = () => {
  const { chain } = useNetwork();
  const { fromToken: fromTokenSymbol } = useSwapFormValues();
  const { fromTokens } = useTokens();
  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);
  const { isConnected } = useAccount();
  const spendableBalance = useSpendableBalance({ token: fromToken });
  const depositMax = isConnected ? spendableBalance : undefined;
  const userIsConnectedToWrongNetwork = Boolean(
    chain?.id && fromToken?.chainId && chain.id !== fromToken.chainId
  );

  return { depositMax: userIsConnectedToWrongNetwork ? undefined : depositMax };
};

export { useDepositMax };
