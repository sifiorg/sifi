import { userEvent, within } from '@storybook/testing-library';
import { ChainSelector } from './ChainSelector';
import { MockWagmiDecorator } from '../../../.storybook/decorators/wagmiDecorator';
import { SwapFormKey } from 'src/providers/SwapFormProvider';

export default {
  title: 'Components/ChainSelector',
  component: ChainSelector,
  decorators: [MockWagmiDecorator()],
};

const Default = () => <ChainSelector chainToSet={SwapFormKey.FromChain} />;

const Open = () => <ChainSelector chainToSet={SwapFormKey.ToChain} />;

Open.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  userEvent.click(await canvas.findByRole('button'));
};

export { Default, Open };
