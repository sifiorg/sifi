import { CreateSwap } from '../CreateSwap/CreateSwap';

const Hero = () => (
  <div className="mx-auto flex w-full max-w-[67rem] flex-wrap justify-center px-4 py-4 sm:px-8 lg:px-16">
    <div className="w-full flex-col items-center justify-center md:w-[50%] md:pb-16">
      <h1 className="text-flashbang-white font-display mb-4 text-center text-[1.875rem] sm:text-[2.25rem]">
        Swap
      </h1>
      <div className="mx-auto mb-4 max-w-[27rem]">
        <CreateSwap />
      </div>
    </div>
  </div>
);

export { Hero };
