import { FunctionComponent } from 'react';
import { Navbar } from '@sifi/shared-ui';
import { ReactComponent as LogoWhite } from 'src/assets/logoWhite.svg';
import HeaderMenu from '../HeaderMenu/HeaderMenu';
import { Link } from '../Link/Link';

const Logo = () => <LogoWhite alt="Sifi logo" className="max-h-[2rem]" />;

const navLinks = [
  {
    href: 'https://discord.gg/sXDKcUYnU8',
    title: 'Discord',
    external: true,
  },
  {
    href: 'https://docs.sifi.org',
    title: 'Docs',
    external: true,
  },
];

const Header: FunctionComponent = () => {
  return (
    <>
      <Navbar LinkComponent={Link} Logo={Logo} navLinks={navLinks}>
        <HeaderMenu />
      </Navbar>
    </>
  );
};

export { Header };
