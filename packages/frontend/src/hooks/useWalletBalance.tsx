import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { apiUrl } from '../utils';

type WalletBalanceToken = {
  balance: string;
  chainId: number;
  tokenAddress: string | `0x${string}`;
  usdValue: string;
};

const useWalletBalance = () => {
  const { address } = useAccount();
  const shouldFetch = Boolean(address);

  const walletBalanceResponse = useQuery<WalletBalanceToken[]>(
    ['walletBalance'],
    async () => {
      const { data } = await axios.get(`${apiUrl}/v1/user-wallet-balance?address=${address}`);

      return data;
    },
    {
      enabled: shouldFetch,
    }
  );

  return {
    ...walletBalanceResponse,
  };
};

export { useWalletBalance };
