import { StoryFn } from '@storybook/react';
import { MockWagmiDecorator } from '../../../.storybook/decorators/wagmiDecorator';
import { Header } from './Header';

export default {
  title: 'Components/Header',
  component: Header,
};

const Template: StoryFn<typeof Header> = () => <Header />;

const Default = Template.bind({});

const Connected = Template.bind({});
Connected.decorators = [MockWagmiDecorator()];
Connected.parameters = {
  chromatic: { viewports: [320, 1200] },
};

export { Default, Connected };
