import { Token } from "@sifi/sdk";
import { useAccount, usePublicClient } from "wagmi"
import { useEffect, useState } from "react";
import { ERC20_ABI } from "src/constants";
import type { BalanceMap, MulticallToken } from 'src/types';

const useMultiCallTokenBalance = (tokens: MulticallToken[]): BalanceMap | null => {
  const { address } = useAccount();
  const [addressBalanceMap, setAddressBalanceMap] = useState<BalanceMap | null>(null)
  const publicClient = usePublicClient();

  const tokenContracts = address?.startsWith('0x') ? tokens.map(token => ({
    address: token.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  })) : [];

  const fetchBalances = async () => {
    const data = await publicClient.multicall({ contracts: tokenContracts });
    const balanceMap: BalanceMap = new Map();
  
    for(let i=0; i<tokenContracts.length; i++) {
      const { status, ...args } = data[i];
      const tokenAddress = tokenContracts[i].address.toLowerCase() as `0x${string}`;

      if (status === 'success') {
        const { result } = args as { result: bigint };
        balanceMap.set(tokenAddress, result);
        continue;
      }

      balanceMap.set(tokenAddress, BigInt("0"));
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
