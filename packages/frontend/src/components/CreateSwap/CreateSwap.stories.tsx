import { rest } from 'msw';
import { StoryFn, Meta } from '@storybook/react';
import isChromatic from 'chromatic/isChromatic';
import { CreateSwap } from './CreateSwap';
import { MockWagmiDecorator } from '../../../.storybook/decorators/wagmiDecorator';
import { baseUrl } from 'src/utils';

export default {
  title: 'Components/CreateSwap',
  component: CreateSwap,
} as Meta<typeof CreateSwap>;

const Template: StoryFn<typeof CreateSwap> = () => <CreateSwap />;

// TODO: Need to figure out Wagmi mocking

export const Default = Template.bind({});

export const Loading = Template.bind({});
Loading.parameters = {
  msw: [
    rest.get(`${baseUrl}/lifi/tokens`, (_req, res, ctx) => {
      return res(ctx.delay(isChromatic() ? 5000 : 'infinite'));
    }),
  ],
};

export const Connected = Template.bind({});
Connected.decorators = [MockWagmiDecorator()];
