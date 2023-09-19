import { userEvent, within } from '@storybook/testing-library';
import { NetworkSelector } from './NetworkSelector';
import { MockWagmiDecorator } from '../../../.storybook/decorators/wagmiDecorator';

export default {
  title: 'Components/NetworkSelector',
  component: NetworkSelector,
  decorators: [MockWagmiDecorator()],
};

const Default = () => <NetworkSelector />;

const Open = () => <NetworkSelector />;

Open.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  userEvent.click(await canvas.findByRole('button'));
};

export { Default, Open };
