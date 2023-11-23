import { FunctionComponent } from 'react';
import { Navbar } from '@sifi/shared-ui';
import { ReactComponent as Logo } from 'src/assets/logoWhite.svg';
import HeaderMenu from '../HeaderMenu/HeaderMenu';

const Header: FunctionComponent = () => {
  return (
    <>
      <Navbar Logo={<Logo alt="Sifi logo" className="max-h-[2rem]" />}>
        <HeaderMenu />
      </Navbar>
    </>
  );
};

export { Header };
