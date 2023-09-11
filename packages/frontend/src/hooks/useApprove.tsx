import type { Token } from '@sifi/sdk';
import { useQuery } from '@tanstack/react-query';
import { erc20ABI, mainnet, usePublicClient, useWalletClient } from 'wagmi';
import { useWatch } from 'react-hook-form';
import { MAX_ALLOWANCE } from 'src/constants';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { getTokenBySymbol } from 'src/utils';
import { useQuote } from './useQuote';
import { useTokens } from './useTokens';

const useApprove = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { quote } = useQuote();
  const { tokens } = useTokens();
  const approveAddress = quote?.approveAddress as `0x${string}`;

  const [fromTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken],
  });

  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);

  const requestApproval = async (): Promise<void> => {
    if (!approveAddress) throw new Error('Approval address is missing');
    if (!fromToken) throw new Error('From token is missing');
    if (!walletClient) throw new Error('WalletClient not initialised, is the user connected?');

    // TODO: Handle case when account already has allowance but it's not sufficient

    const hash = await walletClient.writeContract({
      chain: mainnet,
      address: fromToken.address as `0x${string}`,
      abi: erc20ABI,
      functionName: 'approve',
      args: [approveAddress, BigInt(MAX_ALLOWANCE)],
    })

    await publicClient.waitForTransactionReceipt({ hash });
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
