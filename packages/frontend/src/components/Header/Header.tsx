import { FunctionComponent } from 'react';
import { Navbar } from '@sifi/shared-ui';
import { ReactComponent as LogoWhite } from 'src/assets/logoWhite.svg';
import HeaderMenu from '../HeaderMenu/HeaderMenu';
import { Link } from '../Link/Link';
import { useResearchPoints } from 'src/hooks/useResearchPoints';

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

const ResearchPoints = () => {
  const points = useResearchPoints();

  return (
    <div className="text-center sm:text-right relative top-2 font-display px-2 text-sm max-w-7xl m-auto">
      Research Points: {points.data}
    </div>
  );
};

const Header: FunctionComponent = () => {
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
