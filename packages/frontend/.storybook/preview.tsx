import React from 'react';
import { rest } from 'msw';
import { mockTokens, routesMock, mockAddress, mockBalances } from '../src/mocks';
import { AppProvider } from '../src/AppProvider';
import { baseUrl } from '../src/utils';
import '@sifi/shared-ui/dist/index.css';
import '../src/index.css';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { ThemeProvider, themes } from '@sifi/shared-ui';

// https://github.com/mswjs/msw-storybook-addon#configuring-msw
initialize();

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    disable: true,
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  msw: {
    handlers: [
      rest.get(`${baseUrl}/lifi/tokens`, (_, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockTokens));
      }),
      rest.post(`${baseUrl}/lifi/advanced/routes`, (_, res, ctx) => {
        return res(ctx.status(200), ctx.json(routesMock));
      }),
      rest.get(`${baseUrl}/v1/user-wallet-balance?address=${mockAddress}`, (_, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockBalances));
      }),
    ],
  },
};

export const decorators = [
  Story => (
    <AppProvider>
      <Story />
    </AppProvider>
  ),
  withThemeFromJSXProvider({
    Provider: ({ children, theme }) => (
      <ThemeProvider forcedTheme={theme}>{children}</ThemeProvider>
    ),
    defaultTheme: themes.DARK,
    themes: {
      // TypeScript thinks the types of this are wrong, but it's actually correct
      // @ts-ignore
      dark: themes.DARK,
      // @ts-ignore
      light: themes.LIGHT,
    },
  }),
  mswDecorator,
];
