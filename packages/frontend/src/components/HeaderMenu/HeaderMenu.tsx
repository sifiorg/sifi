import { FunctionComponent } from 'react';
import { Menu } from '@sifi/shared-ui';
import { useAccount, useEnsName, useNetwork } from 'wagmi';
import { formatAddress, formatEnsName } from 'src/utils';

const HeaderMenu: FunctionComponent = () => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { chain } = useNetwork();

  if (!address || !isConnected) return null;

  const label = ensName ? formatEnsName(ensName) : formatAddress(address);

  return (
    <Menu label={label}>
      <span className="mb-3 block text-sm" id="network-label">
        Network
      </span>
      <div
        className="font-display text-uppercase block text-base font-bold"
        aria-labelledby="network-label"
      >
        {chain?.name}
      </div>
    </Menu>
  );
};

export default HeaderMenu;
