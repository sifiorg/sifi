import { useContext } from 'react';
import { WalletBalancesContext } from 'src/providers/WalletBalancesProvider';

const useWalletBalances = () => useContext(WalletBalancesContext);

export { useWalletBalances };
