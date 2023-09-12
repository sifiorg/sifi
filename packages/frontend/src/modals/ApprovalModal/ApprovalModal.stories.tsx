import type { Meta, StoryFn } from '@storybook/react';
import { ApprovalModal } from './ApprovalModal';

export default {
  title: 'Modals/ApprovalModal',
  component: ApprovalModal,
} as Meta<typeof ApprovalModal>;

const Template: StoryFn<typeof ApprovalModal> = args => <ApprovalModal {...args} />;

const Default = Template.bind({});
Default.args = {
  isOpen: true,
  closeModal: () => null,
};

export { Default };
