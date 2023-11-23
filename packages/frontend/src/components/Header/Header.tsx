import { FunctionComponent } from 'react';
import { Navbar } from '@sifi/shared-ui';
import { ReactComponent as LogoWhite } from 'src/assets/logoWhite.svg';
import HeaderMenu from '../HeaderMenu/HeaderMenu';

const Logo = () => <LogoWhite alt="Sifi logo" className="max-h-[2rem]" />;

const Header: FunctionComponent = () => {
  return (
    <>
      <Navbar Logo={Logo}>
        <HeaderMenu />
      </Navbar>
    </>
  );
};

export { Header };
