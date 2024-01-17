import React from 'react';
import { Modal } from '@sifi/shared-ui';
import { useSwapHistory } from 'src/providers/SwapHistoryProvider';
import { SwapSideSummary } from 'src/components/SwapSideSummary/SwapSideSummary';
import { formatTokenAmount, getEvmTxUrl } from 'src/utils';
import { getChainById } from 'src/utils/chains';
import { Quote } from '@sifi/sdk';
import { ReactComponent as ShipIcon } from 'src/assets/ship-180px.svg';

type SwapHistoryModalProps = {
  isOpen: boolean;
  closeModal: () => void;
};

type SwapHistoryItemProps = {
  quote: Quote;
  createdAt: Date;
  hash: string;
};

const SwapHistoryItem: React.FC<SwapHistoryItemProps> = ({ quote, createdAt, hash }) => (
  <li key={hash} className="overflow-hidden rounded border">
    <a
      href={getEvmTxUrl(getChainById(quote.fromToken.chainId), hash)}
      target="_blank"
      rel="noreferrer"
    >
      <dl className="px-6 py-6">
        <div className="flex justify-between">
          <span className="text-smoke">{createdAt.toISOString().slice(0, 10)}</span>
          <span className="text-smoke">
            {createdAt.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="pt-6 grid gap-4">
          <SwapSideSummary
            amount={formatTokenAmount(quote.fromAmount.toString(), quote.fromToken.decimals)}
            token={quote.fromToken}
          />
          <SwapSideSummary
            amount={formatTokenAmount(quote.toAmount.toString(), quote.toToken.decimals)}
            token={quote.toToken}
          />
        </div>
      </dl>
    </a>
  </li>
);

const SwapHistoryModalContent: React.FC = () => {
  const { state } = useSwapHistory();

  if (!state.swapHistory.length) {
    return (
      <div className="flex flex-col items-center justify-center pt-6 pb-12 text-center">
        <ShipIcon />
        <div className="text-smoke">No prior interstellar exchanges recorded.</div>
      </div>
    );
  }

  return (
    <ul role="list" className="grid gap-y-8">
      {state.swapHistory.map(swap => (
        <SwapHistoryItem {...swap} key={swap.hash} />
      ))}
    </ul>
  );
};

const SwapHistoryModal: React.FC<SwapHistoryModalProps> = ({ isOpen, closeModal }) => {
  return (
    <Modal isOpen={isOpen} handleClose={closeModal} title="Swap History" className="pb-8">
      <SwapHistoryModalContent />
    </Modal>
  );
};

export { SwapHistoryModal };
export type { SwapHistoryModalProps };
