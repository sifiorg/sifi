import { useSwitchNetwork } from 'wagmi';
import { useTokens } from 'src/hooks/useTokens';
import { getTokenBySymbol } from 'src/utils';
import { Button } from '../Button';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';

const SwitchNetworkButton = () => {
  const { switchNetwork, isLoading: isSwitchingNetwork } = useSwitchNetwork();
  const { tokens } = useTokens();
  const { fromToken: fromTokenSymbol } = useSwapFormValues();
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);

  const handleSwitchNetwork = () => {
    if (!fromToken || !switchNetwork) return;

    switchNetwork(fromToken.chainId);
  };

  return (
    <Button type="button" isLoading={isSwitchingNetwork} onClick={handleSwitchNetwork}>
      Switch Network
    </Button>
  );
};

export { SwitchNetworkButton };
