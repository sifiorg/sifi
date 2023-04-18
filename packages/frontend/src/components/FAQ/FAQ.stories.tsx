import { StoryFn } from '@storybook/react';
import { FAQ } from './FAQ';

export default {
  title: 'Components/FAQ',
  component: FAQ,
};

const Template: StoryFn<typeof FAQ> = () => <FAQ />;

const Default = Template.bind({});

export { Default };
