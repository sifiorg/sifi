import { userEvent, within } from '@storybook/testing-library';
import { HeaderChainSelector } from './HeaderChainSelector';
import { MockWagmiDecorator } from '../../../.storybook/decorators/wagmiDecorator';

export default {
  title: 'Components/HeaderChainSelector',
  component: HeaderChainSelector,
  decorators: [MockWagmiDecorator()],
};

const Default = () => <HeaderChainSelector />;

const Open = () => <HeaderChainSelector />;

Open.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  userEvent.click(await canvas.findByRole('button'));
};

export { Default, Open };
