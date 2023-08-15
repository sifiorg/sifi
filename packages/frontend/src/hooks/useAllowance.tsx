import { ethers } from 'ethers';
import { erc20ABI, useAccount, useContractRead } from 'wagmi';
import { useWatch } from 'react-hook-form';
import { useQuote } from './useQuote';
import { useTokens } from './useTokens';
import { getTokenBySymbol } from '../utils';
import { SwapFormKey } from '../providers/SwapFormProvider';
import { ETH_CONTRACT_ADDRESS, MIN_ALLOWANCE } from '../constants';

const useAllowance = () => {
  const { quote, isFetching: isFetchingQuote } = useQuote();
  const { tokens } = useTokens();
  const { isConnected, address } = useAccount();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const approvalAddress = quote?.estimate.approvalAddress as `0x${string}`;

  const [fromTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken],
  });

  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);

  const enabled =
    !!fromToken &&
    !!approvalAddress &&
    isConnected &&
    !isFetchingQuote &&
    !!address &&
    fromToken.address !== ETH_CONTRACT_ADDRESS;

  const { data: allowance, ...rest } = useContractRead({
    address: fromToken?.address as `0x${string}`,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address || ETH_CONTRACT_ADDRESS, approvalAddress],
    enabled,
    staleTime: Infinity,
  });

  const isAllowanceAboveMinumum = allowance?.gt(ethers.BigNumber.from(MIN_ALLOWANCE));

  return { allowance, isAllowanceAboveMinumum, ...rest };
};

export { useAllowance };
