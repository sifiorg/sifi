import { multicall } from '@wagmi/core';
import { useEffect, useState } from 'react';
import type { Token } from '@sifi/sdk';
import { ethers } from 'ethers';
import { useBalance } from 'wagmi';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';

// Standard ERC20 ABI for `balanceOf` function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function' as const,
    stateMutability: 'view',
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

  const { data: ethBalance } = useBalance({
    address: walletAddress as `0x${string}`,
    chainId: chainId,
  });

  console.log(ethBalance);

  useEffect(() => {
    const fetchBalances = async () => {
      const multicallContracts = tokens.map(token => ({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress],
      }));

      try {
        const data = await multicall({ contracts: multicallContracts as any });

        const newBalances: WalletBalanceToken[] = data
          .map((result, index) => {
            const token = tokens[index];
            if (!token || result.status === 'failure') {
              console.error(
                `Failed to fetch balance for token at address ${token.address} for wallet ${walletAddress}`
              );
              return;
            }

            return {
              balance: ethers.utils.formatUnits(result.result, token.decimals),
              ...token,
            };
          })
          .filter((balance): balance is WalletBalanceToken => balance !== undefined);

        // Add Ethereum balance to the list
        if (ethBalance) {
          newBalances.push({
            balance: ethers.utils.formatUnits(ethBalance.value, 18),
            symbol: 'ETH',
            decimals: 18,
            address: ETH_CONTRACT_ADDRESS,
            chainId: chainId, // Add this line
            name: 'Ethereum', // Add this line
          });
        }

        setBalances(newBalances);
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchBalances();
  }, [walletAddress, tokens, chainId, ethBalance]);

  return balances;
};

export { useMultiTokenBalances };
