import { Modal, Spinner, formatTokenAmount } from '@sifi/shared-ui';
import { FC, FunctionComponent, useEffect } from 'react';
import { ReactComponent as LinkIcon } from 'src/assets/link.svg';
import { ReactComponent as GasIcon } from 'src/assets/icons/gas.svg';
import { ReactComponent as CheckmarkIcon } from 'src/assets/checkmark.svg';
import { SwapSideSummary } from 'src/components/SwapSideSummary/SwapSideSummary';
import { useGasFeeUsd } from 'src/hooks/useGasFeeUsd';
import { Quote } from '@sifi/sdk';
import { SwapPath } from 'src/components/SwapPath/SwapPath';
import { useJumpStatus } from 'src/hooks/useJumpStatus';
import { getSwapExplorerLink } from 'src/utils';

type SwapModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  quote: Quote;
  hash?: `0x${string}`;
};

type IconType = 'completed' | 'gas' | 'loading';

type SwapDetailItemProps = {
  icon?: IconType;
  text: string;
  link?: string;
};

const renderIcon = (iconType?: IconType) => {
  switch (iconType) {
    case 'completed':
      return (
        <CheckmarkIcon
          className="stroke-matrix-green h-8 w-8 bg-darker-gray p-2 rounded-full"
          alt="Checkmark"
        />
      );
    case 'gas':
      return (
        <GasIcon className="fill-matrix-green h-8 w-8 bg-darker-gray p-2 rounded-full" alt="Gas" />
      );
    case 'loading':
      return (
        <div className="fill-matrix-green h-8 w-8 bg-darker-gray pl-[0.375rem] pt-[0.125rem] rounded-full flex">
          <Spinner size={20} />
        </div>
      );
    default:
      return null;
  }
};

const SwapDetailItem: FC<SwapDetailItemProps> = ({ icon, text, link }) => {
  return (
    <div className="flex place-items-center">
      <div className="relative grid h-12 w-12 place-items-center">{renderIcon(icon)}</div>
      <div className="pl-4 text-smoke">{text}</div>
      {link && (
        <a href={link} target="_blank" rel="noreferrer">
          <LinkIcon className=" h-8 w-8 p-2 rounded-full ml-4" alt="Link" />
        </a>
      )}
    </div>
  );
};

const SwapModal: FunctionComponent<SwapModalProps> = ({ isOpen, closeModal, quote, hash }) => {
  const { fromAmount, fromToken, toAmount, toToken } = quote;
  const formattedFromAmount = formatTokenAmount(fromAmount.toString(), fromToken.decimals);
  const formattedToAmount = formatTokenAmount(toAmount.toString(), toToken.decimals);
  const { gasFeeUsd } = useGasFeeUsd({ gas: quote.estimatedGas, chainId: quote.fromToken.chainId });
  const { status, statusText, startPolling, stopPolling } = useJumpStatus();
  const isJump = fromToken.chainId !== toToken.chainId;
  const explorerLink = hash
    ? getSwapExplorerLink(fromToken.chainId, toToken.chainId, hash)
    : undefined;

  useEffect(() => {
    // TODO: Store jump status in state?
    if (isJump && hash && status !== 'success') {
      startPolling(hash);
    }
  }, [hash, isJump, startPolling, status]);

  const handleClose = () => {
    stopPolling();
    closeModal();
    // TODO: Trigger toast on swap modal close so the user can still see the swap progress
  };

  const getSwapStatusText = (): string => {
    if (!hash) return 'Send transaction';
    if (isJump) return statusText;

    return 'Swap completed.';
  };

  const getSwapStatusIcon = (): 'completed' | 'loading' => {
    if (!isJump && hash) return 'completed';
    if (status === 'success') return 'completed';

    return 'loading';
  };

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      closeOnOutsideClick={false}
      title={`Transaction Details`}
    >
      <div className="grid grid-cols-[32px_1fr] gap-5 pb-8">
        {/* TODO: Turn this into a vertical progress bar */}
        <div className="bg-primary-purple m-3 text-4xl">
          <div className="relative right-3">🛸</div>
        </div>
        <div className="grid gap-0">
          <div className="mb-8">
            {fromToken && <SwapSideSummary token={fromToken} amount={formattedFromAmount} />}
          </div>
          <SwapPath quote={quote} />
          <div className="mt-4">
            <SwapDetailItem text="Token allowance approved" icon="completed" />
          </div>
          <SwapDetailItem
            text={getSwapStatusText()}
            icon={getSwapStatusIcon()}
            link={explorerLink}
          />
          <SwapDetailItem text={`Estimated gas fees: $${gasFeeUsd}`} icon="gas" />
          <div className="mt-8">
            {toToken && <SwapSideSummary token={toToken} amount={formattedToAmount} />}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export { SwapModal };
