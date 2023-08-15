import { useQuery } from '@tanstack/react-query';
import { BigNumber, ContractTransaction } from 'ethers';
import { erc20ABI, useSigner, useContract } from 'wagmi';
import { useWatch } from 'react-hook-form';
import { useQuote } from './useQuote';
import { useTokens } from './useTokens';
import { MAX_ALLOWANCE } from '../constants';
import { SwapFormKey } from '../providers/SwapFormProvider';
import { getTokenBySymbol } from '../utils';

const useApprove = () => {
  const { data: signer } = useSigner();
  const { quote } = useQuote();
  const { tokens } = useTokens();
  const approveAddress = quote?.approveAddress as `0x${string}`;

  const [fromTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken],
  });
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);

  const tokenContract = useContract({
    address: fromToken?.address,
    abi: erc20ABI,
    signerOrProvider: signer,
  });

  const requestApproval = async (): Promise<void> => {
    if (!approveAddress) throw new Error('Approval address is missing');
    if (!tokenContract) throw new Error('Token contract is missing');

    const tx = await tokenContract.functions.approve(approveAddress, BigNumber.from(MAX_ALLOWANCE));

    // Wagmi's contract expects to return [ContractTransaction],
    // but it is actually a ContractTransaction
    await (tx as unknown as ContractTransaction).wait();
  };

  return useQuery(
    ['requestApproval', { tokenAddress: fromToken?.address, approveAddress }],
    async () => requestApproval(),
    {
      enabled: false,
      retry: 0,
    }
  );
};

export { useApprove };
