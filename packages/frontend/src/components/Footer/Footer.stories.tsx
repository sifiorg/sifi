import { StoryFn } from '@storybook/react';
import Footer from './Footer';

export default {
  title: 'Components/Footer',
  component: Footer,
};

const Template: StoryFn<typeof Footer> = () => <Footer />;

const Default = Template.bind({});

export { Default };
