import { showToast } from '@sifi/shared-ui';
import { useWatch } from 'react-hook-form';
import { useApprove } from 'src/hooks/useApprove';
import { useAllowance } from 'src/hooks/useAllowance';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { Button } from '../Button';

const ApproveButton = () => {
  const { refetch: refetchApproval, isFetching } = useApprove();
  const { refetch: refetchAllowance } = useAllowance();
  const [fromTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken],
  });

  const handleClick = async () => {
    try {
      await refetchApproval();
      await refetchAllowance();
    } catch (error) {
      if (error instanceof Error) {
        showToast({ type: 'error', text: error.message });
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="mb-2">
      <Button type="button" isLoading={isFetching} onClick={handleClick}>
        Allow the use of your {fromTokenSymbol}
      </Button>
    </div>
  );
};

export { ApproveButton };
