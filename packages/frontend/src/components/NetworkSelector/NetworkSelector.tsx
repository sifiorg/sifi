import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ReactComponent as DownCaret } from 'src/assets/down-caret.svg';
import EthereumIcon from '../../assets/chain-icons/ethereum.svg';
import ArbitrumIcon from '../../assets/chain-icons/arbitrum.svg';
import PolygonIcon from '../../assets/chain-icons/polygon.svg';

// Networks are temporarily hadrcoded

const NETWORK_ICONS = {
  ethereum: EthereumIcon,
  arbitrum: ArbitrumIcon,
  polygon: PolygonIcon,
};

enum SUPPORTED_NETWORKS {
  ethereum = 'ethereum',
  // polygon = 'polygon',
  // arbitrum = 'arbitrum',
}

const DEFAULT_NETWORK = SUPPORTED_NETWORKS.ethereum;

type NetworkType = 'ethereum' | 'polygon' | 'arbitrum';

const getChainIcon = (network: NetworkType) => {
  const iconSrc = NETWORK_ICONS[network];

  return iconSrc ? <img src={iconSrc} alt={network} className="w-6" /> : null;
};

const NetworkSelector: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(DEFAULT_NETWORK);

  return (
    <div className="font-text relative inline-block">
      <Listbox value={selectedNetwork} onChange={setSelectedNetwork}>
        <div className="relative pr-0 sm:pr-4">
          <Listbox.Button
            role="button"
            className="dark:text-flashbang-white text-new-black border-new-black dark:border-darker-gray font-display flex h-12
            items-center gap-3 rounded-md border-0 px-4 py-2 text-sm max-[340px]:gap-3 sm:border-2 md:text-base"
            aria-busy="true"
          >
            {selectedNetwork && getChainIcon(selectedNetwork)}
            <span className="hidden">{selectedNetwork}</span>
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
              {SUPPORTED_NETWORKS && (
                <div className="font-display bg-flashbang-white flex flex-col gap-y-2 p-6 text-sm dark:bg-darkest-gray mr-3  rounded-sm">
                  {Object.values(SUPPORTED_NETWORKS).map(network => (
                    <Listbox.Option
                      key={network}
                      className={() =>
                        `dark:text-flashbang-white text-new-black font-display block cursor-pointer text-left text-base no-underline transition`
                      }
                      value={network}
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
                            <div className="mr-3">{getChainIcon(network)}</div>
                            <span>{network} </span>
                          </div>
                          {selected && (
                            <div>
                              <div className="w-3 h-3 bg-emerald-green rounded-full relative drop-shadow-xs-strong" />
                            </div>
                          )}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </div>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export { NetworkSelector };
