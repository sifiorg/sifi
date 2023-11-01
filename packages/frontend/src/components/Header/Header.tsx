import { FunctionComponent } from 'react';
import { Navbar } from '@sifi/shared-ui';
import logo from 'src/assets/logoWhite.svg';
import HeaderMenu from '../HeaderMenu/HeaderMenu';
import { HeaderChainSelector } from '../HeaderChainSelector/HeaderChainSelector';

const Header: FunctionComponent = () => {
  return (
    <Navbar logo={logo}>
      <HeaderChainSelector />
      <HeaderMenu />
    </Navbar>
  );
};

export { Header };
