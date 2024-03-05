import type { Meta, StoryFn } from '@storybook/react';
import { SwapModal } from './SwapModal';
import { mockQuote } from 'src/mocks/quote.mocks';

export default {
  title: 'Modals/SwapModal',
  component: SwapModal,
} as Meta<typeof SwapModal>;

const Template: StoryFn<typeof SwapModal> = args => <SwapModal {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  closeModal: () => null,
  quote: mockQuote,
};
