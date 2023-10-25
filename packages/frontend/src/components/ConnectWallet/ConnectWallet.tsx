import { type FunctionComponent, useState, useEffect } from 'react';
import { Modal, showToast, WalletOption, useWalletBranding } from '@sifi/shared-ui';
import useConnectWallet from 'src/hooks/useConnectWallet';
import { type SupportedWallet } from 'src/connectors';
import { getViemErrorMessage } from 'src/utils';
import { Button } from '../Button';

const supportedWallets: SupportedWallet[] = ['injected', 'coinbase', 'walletconnect'];

type ConnectWalletModalProps = {
  isOpen: boolean;
  closeModal: () => void;
};

const ConnectWalletModal: FunctionComponent<ConnectWalletModalProps> = ({
  isOpen,
  closeModal,
}: ConnectWalletModalProps) => {
  const { connectWallet, error } = useConnectWallet();
  const { text: injectedWalletText, icon: injectedWalletIcon } = useWalletBranding();

  useEffect(() => {
    if (error) {
      showToast({ text: getViemErrorMessage(error), type: 'error' });
    }
  }, [error]);

  return (
    <Modal isOpen={isOpen} handleClose={closeModal} title="Connect your wallet">
      <div className="pb-6">
        {supportedWallets.map(wallet => (
          <WalletOption
            key={wallet}
            walletOption={wallet}
            activate={() => connectWallet(wallet)}
            injectedWalletName={wallet === 'injected' ? injectedWalletText : undefined}
            injectedWalletIcon={wallet === 'injected' ? injectedWalletIcon : undefined}
          />
        ))}
      </div>
    </Modal>
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
