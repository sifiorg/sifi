import { useWatch } from 'react-hook-form';
import { useSwitchNetwork } from 'wagmi';
import { useTokens } from 'src/hooks/useTokens';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { getTokenBySymbol } from 'src/utils';
import { useAddNetwork } from 'src/hooks/useAddNetwork';
import { Button } from '../Button';
import { useSelectedChain } from 'src/providers/SelectedChainProvider';

const SwitchNetworkButton = () => {
  const { addNetwork } = useAddNetwork();
  const { selectedChain } = useSelectedChain();
  const { switchNetwork, isLoading: isSwitchingNetwork } = useSwitchNetwork({
    onError: async error => {
      if (error?.name.includes('ChainNotConfiguredForConnectorError')) {
        await addNetwork(selectedChain);

        if (!switchNetwork) return;

        switchNetwork(selectedChain.id);
      }
    },
  });
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
    <Button type="button" isLoading={isSwitchingNetwork} onClick={handleSwitchNetwork}>
      Switch Network
    </Button>
  );
};

export { SwitchNetworkButton };
