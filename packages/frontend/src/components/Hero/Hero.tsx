import { texts } from 'src/texts';
import { CreateSwap } from '../CreateSwap/CreateSwap';
import { Stats } from '../Stats/Stats';

const Hero = () => (
  <div className="mx-auto flex w-full max-w-[67rem] min-h-[90vh] flex-wrap justify-center items-center px-4 py-4 sm:px-8 lg:px-16 ">
    <div className="w-full md:w-[50%] relative top-[-5vh]">
      <h1 className="text-flashbang-white font-display mb-0 pb-0 text-center text-[1.875rem] sm:text-[2.25rem]">
        Swap
      </h1>
      <Stats />
      <div className="border-darker-gray mx-auto max-w-[27rem] border-b-[1px] pb-2">
        <CreateSwap />
      </div>
      <p className="text-smoke font-text mx-auto text-center text-base font-light md:max-w-[380px] pt-6">
        {texts.DESCRIPTION}
      </p>
    </div>
  </div>
);

export { Hero };
