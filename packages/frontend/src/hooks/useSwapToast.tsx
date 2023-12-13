import { showToast, Toast } from '@sifi/shared-ui';
import { getEvmTxUrl, getViemErrorMessage } from 'src/utils';
import { usePublicClient } from 'wagmi';
import { useSwapFormValues } from './useSwapFormValues';
import { Chain } from 'viem';
import { useEffect, useRef, useState } from 'react';
// Temporary until shared-ui can e updated to latest
import { toast } from 'react-toastify';
import { useSifi } from 'src/providers/SDKProvider';

const useSwapToast = () => {
  const { getJump } = useSifi();
  const { fromChain, toChain } = useSwapFormValues();
  const publicClient = usePublicClient({ chainId: fromChain.id });
  // const [toast, setToast] = useState({ text: '', type: '', canClose: true });

  const [jumpHash, setJumpHash] = useState<`0x${string}` | null>(null);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (jumpHash) {
      intervalId.current = setInterval(async () => {
        const result = await getJump(jumpHash);
      }, 1000);
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current as NodeJS.Timeout);
      }
    };
  }, [jumpHash]);

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
    const isJump = fromChain !== toChain;
    let explorerLink: string | undefined;
    if (isJump) {
      explorerLink = `https://layerzeroscan.com/tx/${hash}`;
    } else {
      explorerLink = fromChain ? getEvmTxUrl(fromChain, hash) : undefined;
    }

    const swapToastId = toast(<Toast text="Swap started." type="pending" />, {
      closeButton: false,
      closeOnClick: false,
      autoClose: false,
      draggable: false,
    });

    await publicClient.waitForTransactionReceipt({ hash });

    // TODO: What if the transaction fails?

    if (isJump) {
      setJumpHash(hash);
    }

    // if (isJump) {
    //   const intervalId = setInterval(async () => {
    //     const result = await getJump(hash);
    //     console.log(result);
    //     if (result.status === 'pending') {
    //       toast.update(swapToastId, {
    //         render: (
    //           <Toast
    //             text="Jump pending."
    //             type="pending"
    //             link={explorerLink ? { text: 'View Transaction', href: explorerLink } : undefined}
    //           />
    //         ),
    //         type: 'info',
    //       });
    //     } else if (result.status === 'inflight') {
    //       toast.update(swapToastId, {
    //         render: (
    //           <Toast
    //             text="Jump inflight."
    //             type="pending"
    //             link={explorerLink ? { text: 'View Transaction', href: explorerLink } : undefined}
    //           />
    //         ),
    //         type: 'info',
    //       });
    //     } else if (result.status === 'success') {
    //       toast.update(swapToastId, {
    //         render: (
    //           <Toast
    //             text="Jump successful."
    //             type="success"
    //             link={explorerLink ? { text: 'View Transaction', href: explorerLink } : undefined}
    //           />
    //         ),
    //         type: 'info',
    //       });
    //       clearInterval(intervalId);
    //     }
    //   }, 1000);
    // }

    // if (isJump) {
    //   toast.update(swapToastId, {
    //     render: (
    //       <Toast
    //         text="Jump pending."
    //         type="pending"
    //         link={explorerLink ? { text: 'View Transaction', href: explorerLink } : undefined}
    //       />
    //     ),
    //     type: 'info',
    //   });
    // }

    // toast.update(swapToastId, {
    //   render: (
    //     <Toast
    //       text="Swap completed."
    //       type="success"
    //       link={explorerLink ? { text: 'View Transaction', href: explorerLink } : undefined}
    //     />
    //   ),
    //   type: 'info',
    // });
  };

  return { showErrorToast, showSuccessToast };
};

export { useSwapToast };
