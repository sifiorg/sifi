import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { Quote } from '@sifi/sdk';
import { SwapHistoryModal } from 'src/modals/SwapHistoryModal/SwapHistoryModal';
import { localStorageKeys } from 'src/utils/localStorageKeys';

type SwapEvent = {
  quote: Quote;
  createdAt: Date;
  hash: `0x${string}`;
};

type SwapHistoryState = {
  swapHistory: SwapEvent[];
};

type Action = { type: 'ADD_SWAP_EVENT'; payload: SwapEvent };

const initialState: SwapHistoryState = {
  swapHistory: (
    JSON.parse(localStorage.getItem(localStorageKeys.SWAP_HISTORY) || '[]') as SwapEvent[]
  ).map(event => ({
    ...event,
    createdAt: new Date(event.createdAt),
  })),
};

const swapHistoryReducer = (state: SwapHistoryState, action: Action): SwapHistoryState => {
  switch (action.type) {
    case 'ADD_SWAP_EVENT':
      return { ...state, swapHistory: [action.payload, ...state.swapHistory] };
    default:
      return state;
  }
};

const SwapHistoryContext = createContext<{
  state: SwapHistoryState;
  dispatch: React.Dispatch<Action>;
  toggleHistoryModal: () => void;
}>({
  state: initialState,
  dispatch: () => undefined,
  toggleHistoryModal: () => undefined,
});

const SwapHistoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(swapHistoryReducer, undefined, () => {
    const storedState = localStorage.getItem(localStorageKeys.SWAP_HISTORY);
    const swapHistory = JSON.parse(storedState !== null ? storedState : '[]') as SwapEvent[];

    return {
      swapHistory: swapHistory.map(event => ({ ...event, createdAt: new Date(event.createdAt) })),
    };
  });
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const toggleHistoryModal = () => {
    setIsHistoryModalOpen(!isHistoryModalOpen);
  };

  const serializeState = (state: SwapEvent[]) => {
    return JSON.stringify(state, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem(localStorageKeys.SWAP_HISTORY, serializeState(state.swapHistory));
    } catch (error) {
      console.error('Failed to save swap history:', error);
    }
  }, [state.swapHistory]);

  return (
    <SwapHistoryContext.Provider value={{ state, dispatch, toggleHistoryModal }}>
      {children}
      <SwapHistoryModal isOpen={isHistoryModalOpen} closeModal={toggleHistoryModal} />
    </SwapHistoryContext.Provider>
  );
};

const useSwapHistory = () => useContext(SwapHistoryContext);

export { SwapHistoryProvider, useSwapHistory };
