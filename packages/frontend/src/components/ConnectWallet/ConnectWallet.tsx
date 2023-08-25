import { Dialog, Transition } from '@headlessui/react';
import { type FunctionComponent, useState, Fragment, useEffect } from 'react';
import { showToast, WalletOption } from '@sifi/shared-ui';
import useConnectWallet from 'src/hooks/useConnectWallet';
import closeIcon from 'src/assets/icons/close.svg';
import { type SupportedWallet } from 'src/connectors';
import { Button } from '../Button';

const supportedWallets: SupportedWallet[] = ['metamask', 'coinbase', 'walletconnect'];

type ConnectWalletModalProps = {
  isOpen: boolean;
  closeModal: () => void;
};

const ConnectWalletModal: FunctionComponent<ConnectWalletModalProps> = ({
  isOpen,
  closeModal,
}: ConnectWalletModalProps) => {
  const { connectWallet, error } = useConnectWallet();

  useEffect(() => {
    if (error) {
      showToast({ text: error.message, type: 'error' });
    }
  }, [error]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-new-black fixed inset-0 bg-opacity-60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-new-black border-flashbang-white font-display w-full max-w-md transform overflow-hidden rounded-md border border-b-[6px] p-10 pb-4 align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="bg-new-black text-flashbang-white border-b-darker-gray mb-7 max-w-md border-b-[1px] pb-5 text-left text-4xl font-medium uppercase"
                >
                  Connect <br /> your wallet
                </Dialog.Title>
                {supportedWallets.map(wallet => (
                  <WalletOption
                    key={wallet}
                    walletOption={wallet}
                    activate={() => connectWallet(wallet)}
                  />
                ))}
                <button
                  aria-label="Close dialog"
                  className="absolute top-10 right-10"
                  onClick={closeModal}
                  type="button"
                >
                  <img src={closeIcon} alt="Close icon" />
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const ConnectWallet: FunctionComponent = () => {
  const { isLoading } = useConnectWallet();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      <Button type="button" isLoading={isLoading} onClick={() => setIsModalOpen(true)}>
        Connect Wallet
      </Button>
      <ConnectWalletModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
    </>
  );
};

export { ConnectWallet, ConnectWalletModal, type ConnectWalletModalProps };
