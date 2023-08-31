import { useWatch } from 'react-hook-form';
import { useAccount, useNetwork } from 'wagmi';
import { ethers } from 'ethers';
import { useCullQueries } from 'src/hooks/useCullQueries';
import { useAllowance } from 'src/hooks/useAllowance';
import { useApprove } from 'src/hooks/useApprove';
import { useTokens } from 'src/hooks/useTokens';
import { useQuote } from 'src/hooks/useQuote';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { getTokenBySymbol } from 'src/utils';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { ApproveButton } from './ApproveButton';
import { SwitchNetworkButton } from './SwitchNetworkButton';
import { Button } from '../Button';
import { ConnectWallet } from '../ConnectWallet/ConnectWallet';

const CreateSwapButtons = ({ isLoading }: { isLoading: boolean }) => {
  useCullQueries('routes');
  useCullQueries('quote');
  const { isConnected } = useAccount();
  const { quote, isFetching: isFetchingQuote } = useQuote();
  const { chain } = useNetwork();
  const { tokens } = useTokens();
  const { isFetching: isApproving } = useApprove();
  const { allowance, isAllowanceAboveFromAmount, isFetching: isFetchingAllowance } = useAllowance();
  const [fromTokenSymbol, toTokenSymbol, fromAmount] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const toToken = getTokenBySymbol(toTokenSymbol, tokens);
  const isFromEthereum = fromToken?.address === ETH_CONTRACT_ADDRESS;
  const userIsConnectedToWrongNetwork = Boolean(
    chain?.id && fromToken?.chainId && chain.id !== fromToken.chainId
  );
  const { data: fromBalance } = useTokenBalance(fromToken);
  const fromAmountInWei = ethers.utils.parseUnits(fromAmount || '0', fromToken?.decimals);
  const hasSufficientBalance = quote && fromBalance?.value.gt(fromAmountInWei);

  const isShiftButtonLoading = isLoading || isFetchingAllowance || isFetchingQuote;

  const showApproveButton =
    Boolean(
      !!quote &&
        !!allowance &&
        !isAllowanceAboveFromAmount &&
        !isFromEthereum &&
        hasSufficientBalance
    ) || isApproving;

  const isShiftButtonDisabled =
    !isConnected || showApproveButton || !fromAmount || !hasSufficientBalance;

  const getShiftButtonLabel = () => {
    if (fromToken?.address === toToken?.address) {
      return 'Cannot shift same tokens';
    }

    if (!fromAmount) return 'Enter an amount';

    const hasFetchedSwapQuote = !!quote || isFromEthereum;
    if (fromBalance && hasFetchedSwapQuote && !hasSufficientBalance) {
      // TODO: Does not work properly once switching to a Token
      return 'Insufficient Balance';
    }

    return 'Shift';
  };

  if (!isConnected) return <ConnectWallet />;
  if (userIsConnectedToWrongNetwork) return <SwitchNetworkButton />;

  return (
    <>
      {showApproveButton && <ApproveButton />}
      <Button isLoading={isShiftButtonLoading} disabled={isShiftButtonDisabled}>
        {getShiftButtonLabel()}
      </Button>
    </>
  );
};

export { CreateSwapButtons };
