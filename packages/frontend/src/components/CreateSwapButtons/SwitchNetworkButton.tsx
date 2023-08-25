import { useWatch } from 'react-hook-form';
import { useSwitchNetwork } from 'wagmi';
import { useTokens } from 'src/hooks/useTokens';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { getTokenBySymbol } from 'src/utils';
import { Button } from '../Button';

const SwitchNetworkButton = () => {
  const { switchNetwork, isLoading: isSwitchingNetwork } = useSwitchNetwork();
  const { tokens } = useTokens();
  const [fromTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken, SwapFormKey.ToToken, SwapFormKey.FromAmount],
  });
  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);

  const handleSwitchNetwork = () => {
    if (!fromToken || !switchNetwork) return;

    switchNetwork(fromToken.chainId);
  };

  return (
    <div className="mb-2">
      <Button type="button" isLoading={isSwitchingNetwork} onClick={handleSwitchNetwork}>
        Switch Network
      </Button>
    </div>
  );
};

export { SwitchNetworkButton };
