import { Hero as HeroComponent } from '@sifi/shared-ui';
import { CreateSwap } from '../CreateSwap/CreateSwap';

const Hero = () => (
  <HeroComponent
    title="The Best Rates in DeFi"
    body="Find the most efficient routes for your trades with our advanced DEX aggregator."
  >
    <div className="flex h-full w-full max-w-[27rem] flex-col justify-center">
      <CreateSwap />
    </div>
  </HeroComponent>
);

export { Hero };
