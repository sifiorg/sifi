import { useEffect, useState } from 'react';
import { showToast, Toast, updateToast } from '@sifi/shared-ui';
import { JumpStatus } from '@sifi/sdk';
import { usePublicClient } from 'wagmi';
import { getSwapExplorerLink, getViemErrorMessage } from 'src/utils';
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
  const [toastLink, setToastLink] = useState<{ text: string; href: string } | undefined>(undefined);

  const updateJumpToast = (status: JumpStatus) => {
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
    if (isFetching && isJump && jumpStatus && swapToastId) {
      updateJumpToast(jumpStatus);
    }
  }, [isFetching, isJump, jumpStatus, swapToastId]);

  const showErrorToast = (error: any) => {
    if (error instanceof Error) {
      showToast({ text: getViemErrorMessage(error), type: 'error' });
    } else {
      console.error(error);
    }
  };

  const showSwapToast = async ({ hash }: { hash: `0x${string}` }) => {
    const explorerLink = getSwapExplorerLink(fromChain.id, toChain.id, hash);
    const newToastLink = explorerLink ? { text: 'View Jump', href: explorerLink } : undefined;
    // Need to store this in state so updateJumpToast can access it
    setToastLink(newToastLink);

    const swapToastId = showToast({
      text: `${isJump ? 'Jump' : 'Swap'} initiated. Hold tight.`,
      link: newToastLink,
      type: 'loading',
      hideCloseIcon: true,
      closeOnClick: false,
      autoClose: false,
    });
    setSwapToastId(swapToastId);

    try {
      await publicClient.waitForTransactionReceipt({ hash });

      refetchAllBalances();

      if (isJump) {
        startPollingJumpStatus(hash);
      }

      if (!isJump) {
        refetchAllBalances();
        setThrottle(0.01);
        updateToast(swapToastId, {
          render: <Toast text="Swap completed." type="success" link={newToastLink} />,

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
