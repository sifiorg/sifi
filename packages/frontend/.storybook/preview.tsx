import React from 'react';
import { rest } from 'msw';
import { mockTokens, routesMock, mockAddress, mockBalances } from '../src/mocks';
import { AppProvider } from '../src/AppProvider';
import { apiUrl } from '../src/utils';
import '@sifi/shared-ui/dist/index.css';
import '../src/index.css';
import { initialize, mswDecorator } from 'msw-storybook-addon';

// https://github.com/mswjs/msw-storybook-addon#configuring-msw
initialize();

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  msw: {
    handlers: [
      rest.get(`${apiUrl}/lifi/tokens`, (_, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockTokens));
      }),
      rest.post(`${apiUrl}/lifi/advanced/routes`, (_, res, ctx) => {
        return res(ctx.status(200), ctx.json(routesMock));
      }),
      rest.get(`${apiUrl}/v1/user-wallet-balance?address=${mockAddress}`, (_, res, ctx) => {
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
  mswDecorator,
];
