import { useAccount, usePublicClient } from 'wagmi';
import { useEffect, useState } from 'react';
import { ERC20_ABI, ETH_CONTRACT_ADDRESS } from 'src/constants';
import type { BalanceMap, MulticallToken } from 'src/types';
import { formatTokenAmount } from 'src/utils';
import { useSifi } from 'src/providers/SDKProvider';
import { TokenUsdPrice } from '@sifi/sdk';
import Big from 'big.js';

type UseMultiCallTokenBalance = {
  balanceMap: BalanceMap | null;
  refetch: () => void;
};

const useMultiCallTokenBalance = (
  tokens: MulticallToken[],
  chainId: number
): UseMultiCallTokenBalance => {
  const sifi = useSifi();
  const { address } = useAccount();
  const [addressBalanceMap, setAddressBalanceMap] = useState<BalanceMap | null>(null);
  const publicClient = usePublicClient({ chainId });

  const balanceReadContracts = address?.startsWith('0x')
    ? tokens.map(token => ({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      }))
    : [];

  const fetchEtherBalance = async () => {
    if (!address?.startsWith('0x')) return;

    const balance = await publicClient.getBalance({ address });

    return balance;
  };

  const fetchBalances = async () => {
    const balanceData = await publicClient.multicall({ contracts: balanceReadContracts });
    const etherBalance = await fetchEtherBalance();
    const usdPricesForTokens = await Promise.allSettled(
      tokens.map((token, index) => {
        const isNativeToken = token.address.toLowerCase() === ETH_CONTRACT_ADDRESS.toLowerCase();
        const tokenBalance =
          balanceData[index].status === 'success' ? (balanceData[index].result as bigint) : 0;
        if (tokenBalance > 0 || (isNativeToken && etherBalance && etherBalance > 0)) {
          return sifi.getUsdPrice(chainId, token.address);
        }
      })
    );

    const balanceMap: BalanceMap = new Map();

    for (let i = 0; i < balanceReadContracts.length; i++) {
      try {
        const { status: balanceStatus, ...balanceArgs } = balanceData[i];

        const { address, decimals } = tokens[i];
        const tokenAddress = address.toLowerCase() as `0x${string}`;
        const isNativeToken = tokenAddress === ETH_CONTRACT_ADDRESS.toLowerCase();
        const tokenUsdPrice =
          usdPricesForTokens[i].status === 'fulfilled'
            ? (usdPricesForTokens[i] as PromiseFulfilledResult<TokenUsdPrice | undefined>).value
                ?.usdPrice
            : null;

        if (isNativeToken && etherBalance) {
          const formattedEtherBalance = formatTokenAmount(etherBalance.toString(), 18);
          const usdValue =
            tokenUsdPrice && Number(formattedEtherBalance) > 0
              ? Big(Number(formattedEtherBalance) * Number(tokenUsdPrice)).toFixed(2)
              : null;
          balanceMap.set(tokenAddress, {
            balance: formatTokenAmount(etherBalance.toString(), 18),
            usdValue,
          });
          continue;
        }

        if (balanceStatus === 'success') {
          const { result: rawBalance } = balanceArgs as { result: bigint };
          const formattedTokenBalance = formatTokenAmount(rawBalance.toString(), decimals);
          const usdValue =
            tokenUsdPrice && Number(rawBalance) > 0
              ? Big(Number(formattedTokenBalance) * Number(tokenUsdPrice)).toFixed(2)
              : null;

          balanceMap.set(tokenAddress, { balance: formattedTokenBalance, usdValue });
          continue;
        }

        balanceMap.set(tokenAddress, { balance: '0', usdValue: null });
      } catch (error) {
        console.error(error);
      }
    }

    setAddressBalanceMap(balanceMap);
  };

  const clearBalances = () => {
    setAddressBalanceMap(null);
  };

  useEffect(() => {
    if (!address || !(tokens.length > 0)) {
      clearBalances();
      return;
    }

    fetchBalances();
  }, [address, tokens]);

  return { balanceMap: addressBalanceMap, refetch: fetchBalances };
};

export { useMultiCallTokenBalance };
