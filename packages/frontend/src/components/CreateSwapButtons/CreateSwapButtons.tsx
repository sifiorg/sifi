import { useWatch } from 'react-hook-form';
import { useAccount, useNetwork } from 'wagmi';
import { useCullQueries } from '../../hooks/useCullQueries';
import { Button } from '../Button';
import { ConnectWallet } from '../ConnectWallet/ConnectWallet';
import { useAllowance } from '../../hooks/useAllowance';
import { ApproveButton } from './ApproveButton';
import { SwitchNetworkButton } from './SwitchNetworkButton';
import { useApprove } from '../../hooks/useApprove';
import { useTokens } from '../../hooks/useTokens';
import { useSwapRoutes } from '../../hooks/useSwapRoutes';
import { useQuote } from '../../hooks/useQuote';
import { SwapFormKey } from '../../providers/SwapFormProvider';
import { getTokenBySymbol } from '../../utils';
import { ETH_CONTRACT_ADDRESS } from '../../constants';
import { useTokenBalance } from '../../hooks/useTokenBalance';

const CreateSwapButtons = ({ isLoading }: { isLoading: boolean }) => {
  useCullQueries('routes');
  useCullQueries('quote');
  const { isConnected } = useAccount();
  const { quote, isFetching: isFetchingQuote } = useQuote();
  const { chain } = useNetwork();
  const { tokens } = useTokens();
  const { isFetching: isApproving } = useApprove();
  const { routes, isFetching: isFetchingSwapRoutes } = useSwapRoutes();
  const route = routes?.[0];
  const { allowance, isAllowanceAboveMinumum, isFetching: isFetchingAllowance } = useAllowance();
  const [fromTokenSymbol, fromAmount] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.FromAmount],
  });
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);
  const isFromEthereum = fromToken?.address === ETH_CONTRACT_ADDRESS;
  const userIsConnectedToWrongNetwork = Boolean(
    chain?.id && fromToken?.chainId && chain.id !== fromToken.chainId
  );
  const { data: fromBalance } = useTokenBalance(fromToken);
  const hasSufficientBalance = isFromEthereum
    ? route && fromBalance?.value.gt(route.fromAmount)
    : quote && fromBalance?.value.gt(quote.action.fromAmount);
  const isShiftButtonLoading =
    isLoading || isFetchingAllowance || isFetchingSwapRoutes || isFetchingQuote;

  const showApproveButton =
    Boolean(
      !!quote &&
        !!allowance &&
        !isAllowanceAboveMinumum &&
        !isFromEthereum &&
        hasSufficientBalance
    ) || isApproving;

  const isShiftButtonDisabled =
    !isConnected ||
    !route ||
    isFetchingSwapRoutes ||
    showApproveButton ||
    !fromAmount ||
    !hasSufficientBalance;

  const getShiftButtonLabel = () => {
    if (!fromAmount) return 'Enter an amount';
    const hasFetchedSwapQuote = !!quote || (!!route && isFromEthereum);
    if (fromBalance && hasFetchedSwapQuote && !hasSufficientBalance) {
      return 'Insufficient Balance';
    }

    return 'Shift';
  };

  if (!isConnected) return <ConnectWallet />;
  if (userIsConnectedToWrongNetwork) return <SwitchNetworkButton/>

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
