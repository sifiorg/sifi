import { FunctionComponent } from 'react';
import { Footer as FooterComponent } from '@sifi/shared-ui';
import logo from '../../assets/logo.svg';

const Footer: FunctionComponent = () => {
  return (
    <FooterComponent
      logo={logo}
      description="Find the most efficient routes for your trades with our advanced DEX aggregator."
      columnLinks={[]}
      name="SideShift.fi"
      socialLinks={{ discord: new URL('https://discord.gg/sXDKcUYnU8') }}
      bottomLinks={[]}
    />
  );
};

export default Footer;
