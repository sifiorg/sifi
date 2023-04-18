import { StoryFn } from '@storybook/react';
import { MockWagmiDecorator } from '../../../.storybook/decorators/wagmiDecorator';
import { Hero } from './Hero';

export default {
  title: 'Components/Hero',
  component: Hero,
};

const Template: StoryFn<typeof Hero> = () => <Hero />;

const Default = Template.bind({});

const Connected = Template.bind({});
Connected.decorators = [MockWagmiDecorator()];
Connected.parameters = {
  chromatic: { viewports: [320, 1200] },
};

export { Default, Connected };
