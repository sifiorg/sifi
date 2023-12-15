import { FunctionComponent } from 'react';
import { Navbar } from '@sifi/shared-ui';
import { ReactComponent as LogoWhite } from 'src/assets/logoWhite.svg';
import HeaderMenu from '../HeaderMenu/HeaderMenu';
import { Link } from '../Link/Link';
import { ResearchPoints } from '../ResarchPoints/ResearchPoints';

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
  console.log('Header');
  return (
    <div>
      <Navbar LinkComponent={Link} Logo={Logo} navLinks={navLinks}>
        <HeaderMenu />
      </Navbar>
      <ResearchPoints />
    </div>
  );
};

export { Header };
