import { FunctionComponent } from 'react';
import { Footer as FooterComponent } from '@sifi/shared-ui';
import { ReactComponent as Logo } from '../../assets/logoWhite.svg';
import { texts } from 'src/texts';
import { Link } from '../Link/Link';

const Footer: FunctionComponent = () => {
  const columnLinks = [
    [
      {
        title: 'Dashboard',
        href: '/dashboard',
      },
      {
        href: 'https://docs.sifi.org',
        title: 'Docs',
        external: true,
      },
    ],
    [
      {
        href: 'https://discord.gg/sXDKcUYnU8',
        title: 'Discord',
        external: true,
      },
      {
        href: 'https://github.com/sifiorg/brand-assets',
        title: 'Brand Assets',
        external: true,
      },
    ],
  ];

  return (
    <FooterComponent
      LinkComponent={Link}
      Logo={Logo}
      description={texts.DESCRIPTION}
      columnLinks={columnLinks}
      name={texts.NAME}
      socialLinks={{ discord: new URL('https://discord.gg/sXDKcUYnU8') }}
      bottomLinks={[]}
    />
  );
};

export default Footer;
