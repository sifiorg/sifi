import { CreateSwap } from '../CreateSwap/CreateSwap';

const Hero = () => (
  <div className="mx-auto flex w-full max-w-[67rem] min-h-[90vh] flex-wrap justify-center items-center px-4 py-4 sm:px-8 lg:px-16">
    <div className="w-full md:w-[50%] relative top-[-5vh]">
      <h1 className="text-flashbang-white font-display mb-0 pb-0 text-center text-[1.875rem] sm:text-[2.25rem]">
        Swap
      </h1>
      <div className="mx-auto max-w-[27rem]">
        <CreateSwap />
      </div>
    </div>
  </div>
);

export { Hero };
