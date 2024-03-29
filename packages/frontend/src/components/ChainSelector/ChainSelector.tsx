import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ReactComponent as DownCaret } from 'src/assets/down-caret.svg';
import { SUPPORTED_CHAINS, getChainIcon } from 'src/utils/chains';
import { Chain, useNetwork, useSwitchNetwork } from 'wagmi';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { useFormContext } from 'react-hook-form';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';

type ChainSelectorProps = {
  chainToSet: SwapFormKey.FromChain | SwapFormKey.ToChain;
};

const ChainSelector: React.FC<ChainSelectorProps> = ({ chainToSet }) => {
  const { chain: activeChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { setValue } = useFormContext();
  const { fromChain, toChain } = useSwapFormValues();

  const selectedChain = chainToSet === SwapFormKey.FromChain ? fromChain : toChain;

  const handleChange = (chain: Chain) => {
    setValue(chainToSet, chain);

    if (chainToSet === SwapFormKey.ToChain || !switchNetwork) return;

    switchNetwork(chain.id);
  };

  return (
    <div className="font-text relative flex justify-end top-[1rem]">
      <Listbox value={fromChain} onChange={handleChange}>
        <div className="relative pr-0">
          <Listbox.Button
            role="button"
            className="dark:text-flashbang-white text-new-black border-new-black dark:border-darker-gray font-display flex h-12
            items-center gap-3 rounded-md border-0 px-4 py-2 text-sm max-[340px]:gap-3 sm:border-2 md:text-base"
            aria-busy="true"
          >
            {selectedChain && (
              <div className="flex items-center">
                <img
                  src={getChainIcon(selectedChain.id)}
                  alt={selectedChain.name}
                  className="w-6 mr-2"
                />
                <span>{selectedChain.name} </span>
              </div>
            )}
            <DownCaret
              className={`text-new-black dark:text-flashbang-white w-4

              `}
              aria-hidden="true"
            />
          </Listbox.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Listbox.Options
              className="dark:bg-new-black text-new-black dark:text-flashbang-white bg-cyber-gray absolute right-0 z-30 mt-2 flex max-h-[80vh]
              w-full min-w-[16rem] origin-top-right flex-col overflow-y-auto rounded-sm shadow-lg drop-shadow-xs-strong outline-none"
              aria-busy="true"
            >
              <div className="font-display bg-flashbang-white flex flex-col gap-y-2 p-6 text-sm dark:bg-darkest-gray mr-3  rounded-sm">
                {Object.values(SUPPORTED_CHAINS).map(chain => (
                  <Listbox.Option
                    key={chain.name}
                    className={() =>
                      `dark:text-flashbang-white text-new-black font-display block cursor-pointer text-left text-base no-underline transition`
                    }
                    value={chain}
                  >
                    {({ selected }) => (
                      <div
                        className={`flex rounded-xl place-items-center justify-between p-2  ${
                          selected
                            ? 'bg-dark-gray bg-opacity-20'
                            : 'hover:bg-flashbang-white hover:bg-opacity-10 ease-linear transition-all'
                        } `}
                      >
                        <div className="flex">
                          <div className="mr-3">
                            <img src={getChainIcon(chain.id)} alt={chain.name} className="w-6" />
                          </div>
                          <span>{chain.name}</span>
                        </div>
                        {chain.id === activeChain?.id && (
                          <div>
                            <div className="w-2 h-2 bg-emerald-green rounded-full relative drop-shadow-xs-strong" />
                          </div>
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </div>
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export { ChainSelector };
