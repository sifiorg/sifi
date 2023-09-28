import { useState } from 'react';
import { showToast } from '@sifi/shared-ui';
import { useMutation } from '@tanstack/react-query';
import { erc20ABI, usePublicClient, useWalletClient } from 'wagmi';
import { MAX_ALLOWANCE } from 'src/constants';
import { getEvmTxUrl, getTokenBySymbol } from 'src/utils';
import { useQuote } from './useQuote';
import { useTokens } from './useTokens';
import { useSwapFormValues } from './useSwapFormValues';

const useApprove = () => {
  const { fromChain } = useSwapFormValues();
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const publicClient = usePublicClient({ chainId: fromChain.id });
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const { quote } = useQuote();
  const { fromTokens } = useTokens();
  const approveAddress = (quote?.permit2Address || quote?.approveAddress) as `0x${string}`;

  const { fromToken: fromTokenSymbol } = useSwapFormValues();

  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);

  const closeModal = () => {
    setIsApprovalModalOpen(false);
    setIsLoading(false);
  };

  const openModal = () => setIsApprovalModalOpen(true);

  const requestApproval = async (): Promise<void> => {
    if (!approveAddress) throw new Error('Approval address is missing');
    if (!fromToken) throw new Error('From token is missing');
    if (!walletClient) throw new Error('WalletClient not initialised, is the user connected?');

    setIsLoading(true);

    // TODO: Handle case when account already has allowance but it's not sufficient

    const hash = await walletClient.writeContract({
      chain: fromChain,
      address: fromToken.address as `0x${string}`,
      abi: erc20ABI,
      functionName: 'approve',
      args: [approveAddress, BigInt(MAX_ALLOWANCE)],
    });

    setIsApprovalModalOpen(false);

    await publicClient.waitForTransactionReceipt({ hash });
    const explorerLink = getEvmTxUrl(fromChain, hash);
    showToast({
      type: 'success',
      text: `Approved ${fromTokenSymbol} for trading`,
      link: { href: explorerLink || '', text: 'View Transaction' },
    });
    setIsLoading(false);
  };

  const mutation = useMutation(['requestApproval'], requestApproval, { retry: 0 });

  return { ...mutation, isApprovalModalOpen, closeModal, openModal, isLoading };
};

export { useApprove };
