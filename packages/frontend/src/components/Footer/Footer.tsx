import { FunctionComponent } from 'react';
import { Footer as FooterComponent } from '@sifi/shared-ui';
import { ReactComponent as Logo } from '../../assets/logoWhite.svg';
import { texts } from 'src/texts';

const Footer: FunctionComponent = () => {
  return (
    <FooterComponent
      Logo={Logo}
      description={texts.DESCRIPTION}
      columnLinks={[]}
      name={texts.NAME}
      socialLinks={{ discord: new URL('https://discord.gg/sXDKcUYnU8') }}
      bottomLinks={[]}
    />
  );
};

export default Footer;
