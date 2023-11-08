import { FunctionComponent } from 'react';
import { Navbar } from '@sifi/shared-ui';
import logo from 'src/assets/logoWhite.svg';
import HeaderMenu from '../HeaderMenu/HeaderMenu';

const Header: FunctionComponent = () => {
  return (
    <>
      <Navbar logo={logo}>
        <HeaderMenu />
      </Navbar>
    </>
  );
};

export { Header };
