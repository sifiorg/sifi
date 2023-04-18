import { StoryFn, Meta } from '@storybook/react';
import { MockWagmiDecorator } from '../../../.storybook/decorators/wagmiDecorator';
import { TokenSelector } from './TokenSelector';

export default {
  title: 'Components/TokenSelector',
  component: TokenSelector,
  decorators: [MockWagmiDecorator()],
} as Meta<typeof TokenSelector>;

const Template: StoryFn<typeof TokenSelector> = args => <TokenSelector {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  type: 'from',
  close: () => {},
};

Default.parameters = {
  chromatic: {
    delay: 3000,
  },
};
