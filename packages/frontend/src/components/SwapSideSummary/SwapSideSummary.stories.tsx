import { StoryFn } from '@storybook/react';
import { SwapSideSummary, SwapSideSummaryProps } from './SwapSideSummary';
import { mockTokens } from 'src/mocks';

export default {
  title: 'Components/SwapSideSummary',
  component: SwapSideSummary,
};

const Template: StoryFn<SwapSideSummaryProps> = args => <SwapSideSummary {...args} />;

export const Default: StoryFn<SwapSideSummaryProps> = Template.bind({});
Default.args = {
  token: mockTokens.tokens[1][0],
  amount: '100',
};
