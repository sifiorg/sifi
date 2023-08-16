import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { baseUrl } from '../utils';

type WalletBalanceToken = {
  balance: string;
  chainId: number;
  tokenAddress: string | `0x${string}`;
  usdValue: string;
};

const useWalletBalance = () => {
  const { address } = useAccount();
  // TOOD: Fix wallet balance fetching - /v1/user-wallet-balance endpoint does not exist
  // const shouldFetch = Boolean(address);
  const shouldFetch = false;

  const walletBalanceResponse = useQuery<WalletBalanceToken[]>(
    ['walletBalance'],
    async () => {
      const { data } = await axios.get(`${baseUrl}/v1/user-wallet-balance?address=${address}`);

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
