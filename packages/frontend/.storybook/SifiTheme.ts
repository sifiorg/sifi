import { create } from '@storybook/theming';
import logo from '../src/assets/logoWhite.svg';

export default create({
  appBg: '#171D23',
  barBg: '#171D23',
  barSelectedColor: '#54B8F5',
  barTextColor: '#B3BBCA',
  base: 'dark',
  brandImage: logo,
  brandTarget: '_self',
  brandTitle: 'Sifi Storybook',
  brandUrl: 'https://sifi.org',
  colorPrimary: '#54B8F5',
  colorSecondary: '#54B8F5',
  fontBase: 'GT Pressura Mono',
  textColor: '#FFFFFF',
  textMutedColor: '#B3BBCA',
});
