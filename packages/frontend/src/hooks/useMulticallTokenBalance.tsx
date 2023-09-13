import { useAccount, usePublicClient } from "wagmi"
import { useEffect, useState } from "react";
import { ERC20_ABI, ETH_CONTRACT_ADDRESS } from "src/constants";
import type { BalanceMap, MulticallToken } from 'src/types';
import { formatTokenAmount } from "src/utils";

type UseMultiCallTokenBalance = {
  balanceMap: BalanceMap | null;
  refetch: () => void;
}

const useMultiCallTokenBalance = (tokens: MulticallToken[]): UseMultiCallTokenBalance => {
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

  const fetchEtherBalance = async () => {
    if (!address?.startsWith('0x')) return;

    const balance = await publicClient.getBalance({ address });

    return balance;
  }

  const fetchBalances = async () => {
      const balanceData = await publicClient.multicall({ contracts: balanceReadContracts });
      const decimalData = await publicClient.multicall({ contracts: decimalReadContracts });
      const etherBalance = await fetchEtherBalance();
  
      const balanceMap: BalanceMap = new Map();
    
      for(let i=0; i<balanceReadContracts.length; i++) {
        try {
          const { status: balanceStatus, ...balanceArgs } = balanceData[i];
          const { status: decimalStatus, ...decimalArgs } = decimalData[i];
  
          const tokenAddress = balanceReadContracts[i].address.toLowerCase() as `0x${string}`;
          const isNativeToken = tokenAddress === ETH_CONTRACT_ADDRESS.toLowerCase();

          if (isNativeToken && etherBalance) {
            balanceMap.set(tokenAddress, formatTokenAmount(etherBalance.toString(), 18));
            continue;
          }

          if (balanceStatus === 'success' && decimalStatus === 'success') {
            const { result: rawBalance } = balanceArgs as { result: bigint };
            const { result: decimals } = decimalArgs as { result: number };

            const formattedTokenBalance = formatTokenAmount(rawBalance.toString(), decimals);
      
            balanceMap.set(tokenAddress, formattedTokenBalance);
            continue;
          }

          balanceMap.set(tokenAddress, '0');
                  
        } catch (error) {
          console.error(error);
        }
      }
  
      setAddressBalanceMap(balanceMap);
  }

  useEffect(() => {
    if (!address || !(tokens.length > 0)) return;
    fetchBalances();
  }, [address, tokens]);

  return { balanceMap: addressBalanceMap, refetch: fetchBalances };
};

export { useMultiCallTokenBalance };
