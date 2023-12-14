import { texts } from 'src/texts';
import { CreateSwap } from '../CreateSwap/CreateSwap';
import { Stats } from '../Stats/Stats';

const Hero = () => (
  <div className="mx-auto flex w-full max-w-[67rem] min-h-[90vh] flex-wrap justify-center items-center px-4 py-4 sm:px-8 lg:px-16 ">
    <div className="w-full md:w-[50%] relative top-[-5vh]">
      <div className="text-[8rem] text-center">⚠️</div>
      <h1 className="text-flashbang-white font-display mb-0 pb-0 text-center text-[1.875rem] sm:text-[2.25rem]">
        Galactic Maintenance In Progress
      </h1>
      <div className="border-darker-gray mx-auto max-w-[27rem] border-b-[1px] pb-2">
        {/* <CreateSwap /> */}
        <p className="text-center pt-4">
          Alert: WAGMI, our interstellar wallet conduit, has encountered a cosmic anomaly. To
          safeguard our users in the Sifi galaxy, we have temporarily suspended all wallet
          connections.
        </p>
        <p className="text-center pt-4">
          Advisory: Please initiate protocol disconnection for your wallet across all spaceports,
          including Sifi. Refrain from engaging with any digital applications (dApps) in the cosmic
          web until the space-time continuum is secure.
        </p>
      </div>
      {/* <p className="text-smoke font-text mx-auto text-center text-base font-light md:max-w-[380px] pt-6 pb-6">
        {texts.DESCRIPTION}
      </p>
      <div className="mx-auto max-w-[27rem] ">
        <Stats />
      </div> */}
    </div>
  </div>
);

export { Hero };
