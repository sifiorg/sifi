import { Modal, showToast } from '@sifi/shared-ui';
import { FunctionComponent } from 'react';
import { Button } from 'src/components/Button';
import { ConnectWallet } from 'src/components/ConnectWallet/ConnectWallet';
import { useReferralModal } from 'src/providers/ReferralModalProvider';
import { useAccount } from 'wagmi';

const ReferralModal: FunctionComponent = () => {
  const { isReferralModalOpen, closeReferralModal } = useReferralModal();
  const { address } = useAccount();

  const generateReferralLink = () => {
    if (!address) return null;

    return `https://sifi.org/#/r/${address}`;
  };

  const referralLink = generateReferralLink();

  const handleButtonClick = () => {
    if (!referralLink) {
      showToast({ text: 'Referral link is missing.', type: 'error' });

      return;
    }

    if (navigator.share) {
      // Mobile
      navigator.share({
        title: 'Your Sifi Referral Link',
        url: referralLink,
      });
    } else {
      // Desktop
      navigator.clipboard.writeText(referralLink);
      showToast({ text: 'Referral link copied to clipboard!', type: 'info' });
    }
  };

  const buttonLabel = !!navigator.share ? 'Share Referral Link' : 'Copy Referral Link';

  return (
    <Modal
      isOpen={isReferralModalOpen}
      handleClose={closeReferralModal}
      title="Refer"
      className="pb-0"
    >
      <p className="font-light mb-4 dark:text-smoke text-new-black">
        Refer someone to Sifi and earn 1% of their trading fees.
      </p>

      {address && <div className="select-all break-words text-md">{referralLink}</div>}

      <div className="flex justify-center my-8">
        {address ? (
          <Button role="button" onClick={handleButtonClick}>
            {buttonLabel}
          </Button>
        ) : (
          <ConnectWallet />
        )}
      </div>
    </Modal>
  );
};
export { ReferralModal };
