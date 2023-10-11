import { FunctionComponent } from 'react';
import { Footer as FooterComponent } from '@sifi/shared-ui';
import { ReactComponent as Logo } from '../../assets/logo.svg';

const Footer: FunctionComponent = () => {
  return (
    <FooterComponent
      Logo={Logo}
      description="Swap from anything to anything in a single transaction, we'll find the best route. It's Sifi."
      columnLinks={[]}
      name="SideShift.fi"
      socialLinks={{ discord: new URL('https://discord.gg/sXDKcUYnU8') }}
      bottomLinks={[]}
    />
  );
};

export default Footer;
