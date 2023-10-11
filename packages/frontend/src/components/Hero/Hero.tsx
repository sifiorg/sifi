import { CreateSwap } from '../CreateSwap/CreateSwap';

const Hero = () => (
  <div className="mx-auto flex w-full max-w-[67rem] flex-wrap justify-center px-4 py-4 sm:px-8 lg:px-16">
    <div className="w-full flex-col items-center justify-center md:w-[50%] md:pb-16">
      <h1 className="text-flashbang-white font-display mb-4 text-center text-[1.875rem] sm:text-[2.25rem]">
        On-Chain Swap
      </h1>
      <div className="border-darker-gray mx-auto mb-4 max-w-[27rem] border-b-[1px]">
        <CreateSwap />
      </div>
      <p className="text-smoke font-text mx-auto text-left text-base font-light md:max-w-[380px]">
        {`Swap from anything to anything in a single transaction, we'll find the best route. It's Sifi.`}
      </p>
    </div>
  </div>
);

export { Hero };
