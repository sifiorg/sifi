import { showToast } from '@sifi/shared-ui';
import { useWatch } from 'react-hook-form';
import { useApprove } from 'src/hooks/useApprove';
import { useAllowance } from 'src/hooks/useAllowance';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { ApprovalModal } from 'src/modals';
import { Button } from '../Button';

const ApproveButton = () => {
  const {
    mutateAsync: requestApproval,
    isLoading,
    isApprovalModalOpen,
    setIsApprovalModalOpen,
  } = useApprove();
  const { refetch: refetchAllowance } = useAllowance();
  const [fromTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken],
  });

  const handleClick = async () => {
    try {
      setIsApprovalModalOpen(true);
      await requestApproval();
      await refetchAllowance();
    } catch (error) {
      setIsApprovalModalOpen(false);
      if (error instanceof Error) {
        showToast({ type: 'error', text: error.message });
      } else {
        console.error(error);
      }
    }
  };

  return (
    <>
      <div className="mb-2">
        <Button type="button" isLoading={isLoading} onClick={handleClick}>
          Allow the use of your {fromTokenSymbol}
        </Button>
      </div>

      <ApprovalModal
        tokenName={fromTokenSymbol}
        isOpen={isApprovalModalOpen}
        closeModal={() => setIsApprovalModalOpen(false)}
      />
    </>
  );
};

export { ApproveButton };
