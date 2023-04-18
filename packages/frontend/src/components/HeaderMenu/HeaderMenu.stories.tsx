import { userEvent, within } from '@storybook/testing-library';
import HeaderMenu from './HeaderMenu';
import { MockWagmiDecorator } from '../../../.storybook/decorators/wagmiDecorator';

export default {
  title: 'Components/HeaderMenu',
  component: HeaderMenu,
  decorators: [MockWagmiDecorator()],
};

const Default = () => <HeaderMenu />;

const Open = () => <HeaderMenu />;

Open.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  userEvent.click(await canvas.findByRole('button'));
};

export { Default, Open };
