import { StoryFn, Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { ConnectWalletModal, type ConnectWalletModalProps } from "./ConnectWallet";

export default {
  title: "Components/ConnectWalletModal",
  component: ConnectWalletModal,
} as Meta<typeof ConnectWalletModal>;

const Template: StoryFn<typeof ConnectWalletModal> = (args: ConnectWalletModalProps) => <ConnectWalletModal {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  closeModal: action('close modal clicked'),
};

Default.parameters = {
  chromatic: {
    delay: 500
  },
}

