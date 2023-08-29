import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import type { Token } from '@sifi/sdk';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';

// Standard ERC20 ABI for `balanceOf` function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
];

type WalletBalanceToken = Token & {
  balance: string;
};

const useMultiTokenBalances = (
  walletAddress: string,
  tokens: Token[],
  chainId: number
): WalletBalanceToken[] | undefined => {
  const [balances, setBalances] = useState<WalletBalanceToken[]>();

  const memoizedTokens = useMemo(() => tokens, [tokens]);

  useEffect(() => {
    const fetchBalances = async () => {
      // Temporary
      return;

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);

      const balanceFetchPromises = memoizedTokens.map(async token => {
        if (token.address === ETH_CONTRACT_ADDRESS) {
          return provider.getBalance(walletAddress);
        }

        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        try {
          return await contract.balanceOf(walletAddress);
        } catch (err) {
          console.error(
            `Failed to fetch balance for token at address ${token.address} for wallet ${walletAddress}`
          );
          console.error(err);
          return ethers.BigNumber.from(0); // Return 0 balance if the call fails
        }
      });

      try {
        const data = await Promise.all(balanceFetchPromises);
        const newBalances: WalletBalanceToken[] = data
          .map((balance, index) => {
            const token = tokens[index];
            if (!token) {
              console.error(`Token at index ${index} is undefined`);
              return;
            }

            return {
              balance: ethers.utils.formatUnits(balance, token.decimals),
              ...token,
            };
          })
          .filter((balance): balance is WalletBalanceToken => balance !== undefined);

        setBalances(newBalances);
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchBalances();
  }, [walletAddress, memoizedTokens, chainId]);

  return balances;
};

export { useMultiTokenBalances };
