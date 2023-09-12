import { useAccount, usePublicClient } from "wagmi"
import { useEffect, useState } from "react";
import { ERC20_ABI } from "src/constants";
import type { BalanceMap, MulticallToken } from 'src/types';
import { formatUnits } from "viem";
import { formatTokenAmount } from "src/utils";

const useMultiCallTokenBalance = (tokens: MulticallToken[]): BalanceMap | null => {
  const { address } = useAccount();
  const [addressBalanceMap, setAddressBalanceMap] = useState<BalanceMap | null>(null)
  const publicClient = usePublicClient();

  const balanceReadContracts = address?.startsWith('0x') ? tokens.map(token => ({
    address: token.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  })) : [];

  const decimalReadContracts = tokens.map(token => ({
    address: token.address,
    abi: ERC20_ABI,
    functionName: 'decimals',
  }));

  const fetchBalances = async () => {
    const balanceData = await publicClient.multicall({ contracts: balanceReadContracts });
    const decimalData = await publicClient.multicall({ contracts: decimalReadContracts });

    const balanceMap: BalanceMap = new Map();
  
    for(let i=0; i<balanceReadContracts.length; i++) {
      const { status: balanceStatus, ...balanceArgs } = balanceData[i];
      const { status: decimalStatus, ...decimalArgs } = decimalData[i];

      const tokenAddress = balanceReadContracts[i].address.toLowerCase() as `0x${string}`;

      if (balanceStatus === 'success' && decimalStatus === 'success') {
        const { result: rawBalance } = balanceArgs as { result: bigint };
        const { result: decimals } = decimalArgs as { result: number };

        const formattedTokenBalance = formatTokenAmount(formatUnits(rawBalance, decimals));
  
        balanceMap.set(tokenAddress, formattedTokenBalance);
        continue;
      }

      balanceMap.set(tokenAddress, '0');
    }

    setAddressBalanceMap(balanceMap);
  }

  useEffect(() => {
    if (!address) return;
    fetchBalances();
  }, [address]);

  return addressBalanceMap;
};

export { useMultiCallTokenBalance };
export type { MulticallToken };
