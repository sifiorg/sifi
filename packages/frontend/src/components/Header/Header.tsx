import { FunctionComponent } from 'react';
import { Navbar } from '@sifi/shared-ui';
import logo from '../../assets/logo.svg';
import HeaderMenu from '../HeaderMenu/HeaderMenu';

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
      <HeaderMenu />
    </Navbar>
  );
};

export { Header };
