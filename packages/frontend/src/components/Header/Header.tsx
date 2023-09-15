import { FunctionComponent } from 'react';
import { Navbar } from '@sifi/shared-ui';
import logo from 'src/assets/logoWhite.svg';
import HeaderMenu from '../HeaderMenu/HeaderMenu';
import { NetworkSwitch } from '../NetworkSwitch/NetworkSwitch';

const Header: FunctionComponent = () => {
  const navLinks = [
    {
      href: 'https://discord.gg/sXDKcUYnU8',
      title: 'Discord',
      external: true,
    },
  ];

  return (
    <Navbar logo={logo} navLinks={navLinks}>
      <NetworkSwitch />
      <HeaderMenu />
    </Navbar>
  );
};

export { Header };
