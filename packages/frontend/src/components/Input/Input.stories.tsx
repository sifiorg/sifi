import { StoryFn, Meta } from '@storybook/react';
import searchIcon from 'src/assets/search.svg';
import { Input } from './Input';

export default {
  title: 'Components/Input',
  component: Input,
} as Meta<typeof Input>;

const Template: StoryFn<typeof Input> = args => (
  <div className="max-w-md">
    <Input {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  placeholder: 'placeholder text',
  id: 'cool-input',
};

export const WithValue = Template.bind({});
WithValue.args = {
  ...Default.args,
  value: '123.456',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  ...Default.args,
  icon: { src: searchIcon, alt: 'Search Icon' },
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  disabled: true,
};
