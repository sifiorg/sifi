import { FunctionComponent } from 'react';
import { Menu, useWalletBranding } from '@sifi/shared-ui';
import { useAccount, useDisconnect, useEnsName, useNetwork } from 'wagmi';
import { formatAddress, formatEnsName } from 'src/utils';
import { Link } from '../Link/Link';
import { useSwapHistory } from 'src/providers/SwapHistoryProvider';
import { useReferralModal } from 'src/providers/ReferralModalProvider';
import { ConnectWallet } from '../ConnectWallet/ConnectWallet';

const HeaderMenu: FunctionComponent = () => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const { icon, text } = useWalletBranding();
  const { toggleHistoryModal } = useSwapHistory();
  const { openReferralModal } = useReferralModal();

  if (!address || !isConnected)
    return (
      <div className="hidden md:block">
        <ConnectWallet size="small" />
      </div>
    );

  const label = ensName ? formatEnsName(ensName) : formatAddress(address);

  const menuLinks = [
    {
      title: 'Swap History',
      onClick: () => toggleHistoryModal(),
    },
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Refer',
      onClick: () => openReferralModal(),
    },
    {
      title: 'Disconnect Wallet',
      onClick: () => disconnect(),
    },
  ];

  return (
    <Menu
      LinkComponent={Link}
      icon={icon ? { src: icon, alt: `${text} icon` } : undefined}
      label={label}
      links={menuLinks}
    >
      <div className="px-6 py-4">
        <span className="mb-3 block text-sm" id="network-label">
          Network
        </span>
        <div
          className="font-display text-uppercase block text-base font-bold"
          aria-labelledby="network-label"
        >
          {chain?.name}
        </div>
      </div>
    </Menu>
  );
};

export default HeaderMenu;
