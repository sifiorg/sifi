import { useMutation } from '@tanstack/react-query';
import { useWalletClient } from 'wagmi';
import { STAR_VAULT_ABI, SIFI_CONTRACT_ADDRESS } from 'src/constants';
import { showToast } from '@sifi/shared-ui';
import { getEvmTxUrl } from 'src/utils';
import { getChainById } from 'src/utils/chains';

const usePartnerWithdraw = () => {
  const { data: walletClient } = useWalletClient();

  return useMutation(
    ['partnerWithdraw'],
    async ({ tokenAddress, chainId }: { tokenAddress: string; chainId: number }) => {
      if (!walletClient) throw new Error('WalletClient not initialised, is the user connected?');

      const chain = getChainById(chainId);

      const receipt = await walletClient.writeContract({
        chain,
        address: SIFI_CONTRACT_ADDRESS,
        abi: STAR_VAULT_ABI,
        functionName: 'partnerWithdraw',
        args: [tokenAddress],
      });

      if (receipt) {
        const explorerLink = getEvmTxUrl(chain, receipt);

        showToast({
          text: 'Withdrawal successful',
          type: 'success',
          ...(explorerLink ? { link: { text: 'View Transaction', href: explorerLink } } : {}),
        });

        return receipt;
      }
    }
  );
};

export { usePartnerWithdraw };
