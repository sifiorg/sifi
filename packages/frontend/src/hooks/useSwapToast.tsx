import { useEffect, useState } from 'react';
import { showToast, Toast, updateToast } from '@sifi/shared-ui';
import { JumpStatus } from '@sifi/sdk';
import { usePublicClient } from 'wagmi';
import { getEvmTxUrl, getViemErrorMessage } from 'src/utils';
import { useSpaceTravel } from 'src/providers/SpaceTravelProvider';
import { useSwapFormValues } from './useSwapFormValues';
import { useRefetchBalances } from './useRefetchBalances';
import { useJumpStatus } from './useJumpStatus';

const useSwapToast = () => {
  const { fromChain, toChain } = useSwapFormValues();
  const { refetchAllBalances } = useRefetchBalances();
  const publicClient = usePublicClient({ chainId: fromChain.id });
  const { setThrottle } = useSpaceTravel();
  const {
    status: jumpStatus,
    isFetching,
    startPolling: startPollingJumpStatus,
    stopPolling: stopPollingJumpStatus,
  } = useJumpStatus();
  const isJump = fromChain.id !== toChain.id;
  const [swapToastId, setSwapToastId] = useState<string | number | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [explorerLink, setExplorerLink] = useState<string | undefined>(undefined);

  const updateJumpToast = (status: JumpStatus) => {
    const toastLink = explorerLink ? { text: 'View Jump', href: explorerLink } : undefined;

    let toastContent = {};

    switch (status) {
      case 'pending':
        toastContent = {
          render: (
            <Toast
              text="In hyperspace. Arrival imminent..."
              type="loading"
              link={toastLink}
              hideCloseIcon
            />
          ),
        };
        break;
      case 'inflight':
        setThrottle(0.25);
        toastContent = {
          render: <Toast text="Arriving..." type="loading" link={toastLink} hideCloseIcon />,
        };
        break;
      case 'success':
        refetchAllBalances();
        setThrottle(0.01);
        toastContent = {
          render: <Toast text="Jump completed." type="success" link={toastLink} />,
          closeOnClick: true,
        };
        stopPollingJumpStatus();
        break;
      default:
        break;
    }

    if (swapToastId && Object.keys(toastContent).length > 0) {
      updateToast(swapToastId, toastContent);
    }
  };

  useEffect(() => {
    if (hash && isFetching && isJump && jumpStatus && swapToastId) {
      updateJumpToast(jumpStatus);
    }
  }, [hash, isFetching, isJump, jumpStatus, swapToastId]);

  const showErrorToast = (error: any) => {
    if (error instanceof Error) {
      showToast({ text: getViemErrorMessage(error), type: 'error' });
    } else {
      console.error(error);
    }
  };

  const showSwapToast = async ({ hash }: { hash: `0x${string}` }) => {
    if (isJump) {
      setExplorerLink(`https://layerzeroscan.com/tx/${hash}`);
    } else {
      setExplorerLink(fromChain ? getEvmTxUrl(fromChain, hash) : undefined);
    }

    const swapToastId = showToast({
      text: `${isJump ? 'Jump' : 'Swap'} initiated. Hold tight.`,
      type: 'loading',
      hideCloseIcon: true,
      closeOnClick: false,
      autoClose: false,
    });
    setSwapToastId(swapToastId);

    try {
      await publicClient.waitForTransactionReceipt({ hash });
      setHash(hash);
      refetchAllBalances();

      if (isJump) {
        startPollingJumpStatus(hash);
      }

      if (!isJump) {
        refetchAllBalances();
        setThrottle(0.01);
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
    } catch (error) {
      showErrorToast(error);
    }
  };

  return { showErrorToast, showSwapToast };
};

export { useSwapToast };
