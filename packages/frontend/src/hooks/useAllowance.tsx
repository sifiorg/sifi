import { erc20ABI, useAccount, useContractRead } from 'wagmi';
import { parseUnits } from 'viem';
import { getTokenBySymbol } from 'src/utils';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { ETH_CONTRACT_ADDRESS, MIN_ALLOWANCE } from 'src/constants';
import { useWatch } from 'react-hook-form';
import { useQuote } from './useQuote';
import { useTokens } from './useTokens';

const useAllowance = () => {
  const { quote, isFetching: isFetchingQuote } = useQuote();
  const { tokens } = useTokens();
  const { isConnected, address } = useAccount();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const approveAddress = quote?.approveAddress as `0x${string}`;

  const [fromTokenSymbol, fromAmount] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.FromAmount],
  });

  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);

  const enabled =
    !!fromToken &&
    !!approveAddress &&
    isConnected &&
    !isFetchingQuote &&
    !!address &&
    fromToken.address !== ETH_CONTRACT_ADDRESS;

  const { data: allowance, ...rest } = useContractRead({
    address: fromToken?.address as `0x${string}`,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address || ETH_CONTRACT_ADDRESS, approveAddress],
    enabled,
    staleTime: Infinity,
  });

  // TODO: Display errors in a toast

  const fromAmountInWei = fromToken ? parseUnits(fromAmount || '0', fromToken.decimals) : BigInt(0);
  const isAllowanceAboveFromAmount =
    allowance !== undefined && allowance >= fromAmountInWei;

  return { allowance, isAllowanceAboveFromAmount, ...rest };
};

export { useAllowance };
