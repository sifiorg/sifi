import { showToast } from '@sifi/shared-ui';
import { getEvmTxUrl, getViemErrorMessage } from 'src/utils';
import { usePublicClient } from 'wagmi';
import { useSwapFormValues } from './useSwapFormValues';
import { Chain } from 'viem';

const useSwapToast = () => {
  const { fromChain, toChain } = useSwapFormValues();
  const publicClient = usePublicClient({ chainId: fromChain.id });

  const showErrorToast = (error: any) => {
    if (error instanceof Error) {
      showToast({ text: getViemErrorMessage(error), type: 'error' });
    } else {
      console.error(error);
    }
  };

  const showSuccessToast = async ({
    fromChain,
    hash,
  }: {
    fromChain: Chain;
    hash: `0x${string}`;
  }) => {
    const explorerLink = fromChain ? getEvmTxUrl(fromChain, hash) : undefined;

    showToast({
      text: 'Your swap has been confirmed. Please stand by.',
      type: 'info',
    });

    await publicClient.waitForTransactionReceipt({ hash });

    showToast({
      type: 'success',
      text: 'Your swap has confirmed. It may take a while until it confirms on the blockchain.',
      ...(explorerLink ? { link: { text: 'View Transaction', href: explorerLink } } : {}),
    });
  };

  return { showErrorToast, showSuccessToast };
};

export { useSwapToast };
