import { Hero as HeroComponent } from '@sifi/shared-ui';
import { CreateSwap } from '../CreateSwap/CreateSwap';

const Hero = () => (
  <HeroComponent
    title="On-Chain Swap"
    body="We'll find the optimal route for your swap. You get the best price. It's Sifi."
  >
    <div className="flex h-full w-full max-w-[27rem] flex-col justify-center">
      <CreateSwap />
    </div>
  </HeroComponent>
);

export { Hero };
