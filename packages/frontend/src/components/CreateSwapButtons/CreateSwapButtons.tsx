import { useAccount, useNetwork } from 'wagmi';
import { parseUnits } from 'viem';
import { useCullQueries } from 'src/hooks/useCullQueries';
import { useAllowance } from 'src/hooks/useAllowance';
import { useApprove } from 'src/hooks/useApprove';
import { useTokens } from 'src/hooks/useTokens';
import { useQuote } from 'src/hooks/useQuote';
import { getTokenBySymbol, isValidTokenAmount } from 'src/utils';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { ApproveButton } from './ApproveButton';
import { SwitchNetworkButton } from './SwitchNetworkButton';
import { Button } from '../Button';
import { ConnectWallet } from '../ConnectWallet/ConnectWallet';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';

const CreateSwapButtons = ({ isLoading }: { isLoading: boolean }) => {
  useCullQueries('routes');
  useCullQueries('quote');
  const { isConnected } = useAccount();
  const { quote, isFetching: isFetchingQuote } = useQuote();
  const { chain } = useNetwork();
  const { fromTokens, toTokens } = useTokens();
  const { isLoading: isApproving } = useApprove();
  const { allowance, isAllowanceAboveFromAmount, isFetching: isFetchingAllowance } = useAllowance();
  const {
    fromToken: fromTokenSymbol,
    toToken: toTokenSymbol,
    fromAmount,
    fromChain,
    toChain,
  } = useSwapFormValues();
  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);
  const toToken = getTokenBySymbol(toTokenSymbol, toTokens);
  const isFromEthereum = fromToken?.address === ETH_CONTRACT_ADDRESS;
  const userIsConnectedToWrongNetwork = Boolean(
    chain?.id && fromToken?.chainId && chain.id !== fromToken.chainId
  );
  const { data: fromBalance } = useTokenBalance(fromToken, fromChain.id);
  const fromAmountInWei = fromToken ? parseUnits(fromAmount || '0', fromToken.decimals) : BigInt(0);
  const hasSufficientBalance = quote && fromBalance && fromBalance.value >= fromAmountInWei;

  const isShiftButtonLoading = isLoading || isFetchingAllowance || isFetchingQuote;

  const showApproveButton =
    Boolean(
      !!quote &&
      allowance !== undefined &&
      !isAllowanceAboveFromAmount &&
      !isFromEthereum &&
      hasSufficientBalance
    ) || isApproving;

  const isShiftButtonDisabled =
    !isConnected ||
    showApproveButton ||
    !fromAmount ||
    !hasSufficientBalance ||
    !isValidTokenAmount(fromAmount);

  const getShiftButtonLabel = () => {
    if (fromToken?.address === toToken?.address && fromChain === toChain) {
      return 'Cannot shift same tokens';
    }

    if (!fromAmount) return 'Enter an amount';

    if (!isValidTokenAmount(fromAmount)) return 'Enter a valid amount';

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
