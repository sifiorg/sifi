import { showToast, Toast, updateToast } from '@sifi/shared-ui';
import { getEvmTxUrl, getViemErrorMessage } from 'src/utils';
import { usePublicClient } from 'wagmi';
import { useSwapFormValues } from './useSwapFormValues';
import { useSifi } from 'src/providers/SDKProvider';

const useSwapToast = () => {
  const sifi = useSifi();
  const { fromChain, toChain } = useSwapFormValues();
  const publicClient = usePublicClient({ chainId: fromChain.id });

  const showErrorToast = (error: any) => {
    if (error instanceof Error) {
      showToast({ text: getViemErrorMessage(error), type: 'error' });
    } else {
      console.error(error);
    }
  };

  const showSwapToast = async ({ hash }: { hash: `0x${string}` }) => {
    const isJump = fromChain.id !== toChain.id;
    let explorerLink: string | undefined;
    if (isJump) {
      explorerLink = `https://layerzeroscan.com/tx/${hash}`;
    } else {
      explorerLink = fromChain ? getEvmTxUrl(fromChain, hash) : undefined;
    }

    const swapToastId = showToast({
      text: `${isJump ? 'Jump' : 'Swap'} initiated. Hold tight.`,
      type: 'loading',
      hideCloseIcon: true,
      closeOnClick: false,
      autoClose: false,
    });

    await publicClient.waitForTransactionReceipt({ hash });

    // TODO: What if the transaction fails?

    if (isJump) {
      const intervalId = setInterval(async () => {
        const result = await sifi.getJump(hash);

        if (result.status === 'pending') {
          updateToast(swapToastId, {
            render: (
              <Toast
                text="Jump initiated. Hold tight."
                type="loading"
                link={explorerLink ? { text: 'View Jump', href: explorerLink } : undefined}
                hideCloseIcon
              />
            ),
          });
        } else if (result.status === 'inflight') {
          updateToast(swapToastId, {
            render: (
              <Toast
                text="In hyperspace. Arrival imminent."
                type="loading"
                link={explorerLink ? { text: 'View Jump', href: explorerLink } : undefined}
                hideCloseIcon
              />
            ),
          });
        } else if (result.status === 'success') {
          updateToast(swapToastId, {
            render: (
              <Toast
                text="Jump completed."
                type="success"
                link={explorerLink ? { text: 'View Jump', href: explorerLink } : undefined}
              />
            ),
            closeOnClick: true,
          });
          clearInterval(intervalId);
        }
      }, 1000);
    }

    if (!isJump) {
      updateToast(swapToastId, {
        render: (
          <Toast
            text="Swap completed."
            type="success"
            link={explorerLink ? { text: 'View Swap', href: explorerLink } : undefined}
          />
        ),
        closeOnClick: true,
      });
    }
  };

  return { showErrorToast, showSwapToast };
};

export { useSwapToast };
