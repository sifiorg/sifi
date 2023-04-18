import { StoryFn, Meta, ComponentStory } from '@storybook/react';
import { CreateSwapButtons } from './CreateSwapButtons';
import { MockWagmiDecorator } from '../../../.storybook/decorators/wagmiDecorator';

export default {
  title: 'Components/CreateSwapButtons',
  component: CreateSwapButtons,
} as Meta<typeof CreateSwapButtons>;

const Template: StoryFn<typeof CreateSwapButtons> = args => <CreateSwapButtons {...args} />;

export const Default = Template.bind({});

export const Connected = Template.bind({});
Connected.decorators = [MockWagmiDecorator()];

export const Loading = Template.bind({});
Loading.decorators = [...Connected.decorators];
Loading.args = { isLoading: true };

// TODO: Add missing states
// - Wrong network (requires Wagmi chain id mocking)
// - Insufficient balance (requires form mocking)
// - Shift state - (requires from mocking)
