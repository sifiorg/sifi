import { useFeeData, useNetwork } from 'wagmi';
import { formatEther } from 'viem';
import { Token } from '@sifi/sdk';
import { ETH_CONTRACT_ADDRESS, SWAP_MAX_GAS_UNITS } from 'src/constants';
import { useTokenBalance } from './useTokenBalance';

type UseSpendableBalanceOptions = {
  token: Token | null;
};

const useSpendableBalance = ({ token }: UseSpendableBalanceOptions): string | undefined => {
  const { chain } = useNetwork();
  const { data: feeData } = useFeeData({ chainId: chain?.id, formatUnits: 'wei' });
  const isNativeToken = token?.address === ETH_CONTRACT_ADDRESS;
  const { data: fromTokenBalanceData } = useTokenBalance(token);

  if (!feeData?.maxFeePerGas || !fromTokenBalanceData) {
    return '0';
  }

  if (!isNativeToken) {
    return fromTokenBalanceData.formatted;
  }

  const maxGasCost = formatEther(feeData.maxFeePerGas * BigInt(SWAP_MAX_GAS_UNITS));

  return Number(maxGasCost) > Number(fromTokenBalanceData?.formatted)
    ? '0'
    : (Number(fromTokenBalanceData.formatted) - Number(maxGasCost)).toString();
};

export { useSpendableBalance };
