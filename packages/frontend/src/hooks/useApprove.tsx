import { useQuery } from '@tanstack/react-query';
import { BigNumber, ContractTransaction } from 'ethers';
import { erc20ABI } from 'wagmi';
import { getContract } from 'wagmi/actions';
import { useWatch } from 'react-hook-form';
import { MAX_ALLOWANCE } from 'src/constants';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { getTokenBySymbol } from 'src/utils';
import { useQuote } from './useQuote';
import { useTokens } from './useTokens';

const useApprove = () => {
  const { quote } = useQuote();
  const { tokens } = useTokens();
  const approveAddress = quote?.approveAddress as `0x${string}`;

  const [fromTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken],
  });
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);

  const tokenContract = fromToken?.address
    ? getContract({
        address: fromToken?.address as `0x${string}`,
        abi: erc20ABI,
        // signerOrProvider: signer,
      })
    : undefined;

  const requestApproval = async (): Promise<void> => {
    if (!approveAddress) throw new Error('Approval address is missing');
    if (!tokenContract) throw new Error('Token contract is missing');

    // TODO: Handle case when account already has allowance but it's not sufficient

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
