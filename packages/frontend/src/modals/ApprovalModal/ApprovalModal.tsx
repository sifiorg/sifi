import { Modal } from '@sifi/shared-ui';
import { FunctionComponent } from 'react';
import { ReactComponent as InfoIcon } from 'src/assets/info.svg';
import { ReactComponent as CheckmarkIcon } from 'src/assets/checkmark.svg';

type ApprovalModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  tokenName: string;
};

const ApprovalModal: FunctionComponent<ApprovalModalProps> = ({
  isOpen,
  closeModal,
  tokenName,
}) => {
  return (
    <Modal isOpen={isOpen} handleClose={closeModal} title={`Approve ${tokenName} for trading`}>
      <p className="font-light mb-6 dark:text-smoke text-new-black">
        Review and select the ideal spending cap in your wallet for trading {tokenName}.
        SideShift.fi only withdraws funds for signed open orders.
      </p>
      <div className="grid sm:grid-cols-2 gap-8 mb-12">
        <div className="dark:bg-code-blue bg-light-smoke px-4 py-6 flex items-center flex-col">
          <h2 className="text-center text-2xl mb-6 dark:text-flashbang-white text-new-black">
            Use Default
          </h2>
          <div className="inline-block">
            <div className="flex items-center mb-2">
              <div className="bg-matrix-green rounded-full w-5 h-5 mr-2 flex items-center justify-center text-new-black">
                <CheckmarkIcon />
              </div>
              <span className="text-sm font-light text-new-black dark:text-flashbang-white">
                Only approve once
              </span>
            </div>
            <div className="flex items-center">
              <div className="bg-matrix-green rounded-full w-5 h-5 mr-2 flex items-center justify-center text-smoke">
                <CheckmarkIcon />
              </div>
              <span className="text-sm font-light text-new-black dark:text-flashbang-white">
                Save on future gas fees
              </span>
            </div>
          </div>
        </div>
        <div className="border-b dark:border-darker-gray border-smoke px-4 py-6 flex flex-col items-center">
          <h2 className="text-center text-2xl mb-6 dark:text-flashbang-white text-new-black">
            Max
          </h2>
          <div className="inline-block">
            <div className="flex items-center mb-2">
              <div className="bg-warning-yellow rounded-full w-5 h-5 mr-2 flex items-center justify-center text-new-black">
                <InfoIcon />
              </div>
              <span className="text-sm font-light dark:text-smoke text-dark-gray">
                Approval on Each Order
              </span>
            </div>
            <div className="flex items-center">
              <div className="bg-warning-yellow rounded-full w-5 h-5 mr-2 flex items-center justify-center text-new-black">
                <InfoIcon />
              </div>
              <span className="text-sm font-light dark:text-smoke text-dark-gray">
                Pay gas on every trade
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export { ApprovalModal };
