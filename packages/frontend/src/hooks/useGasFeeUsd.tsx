import { useState, useEffect, useMemo } from 'react';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useUsdValue } from './useUsdValue';
import { usePublicClient } from 'wagmi';
import { formatEther } from 'viem';

type UseGasFeeUsdParams = {
  gas: bigint | string | number;
  chainId: number;
};

const useGasFeeUsd = ({ gas, chainId }: UseGasFeeUsdParams) => {
  const publicClient = usePublicClient({ chainId });
  const gasBigInt = BigInt(gas);
  const [gasPriceWei, setGasPriceWei] = useState<bigint>(gasBigInt);

  useEffect(() => {
    const getGasPrice = async () => {
      try {
        const gasPrice = await publicClient.getGasPrice();
        setGasPriceWei(gasPrice);
      } catch (error) {
        console.error('Failed to fetch gas price:', error);
      }
    };

    getGasPrice();
  }, [publicClient]);

  const totalGasCostEther = useMemo(() => {
    if (!gasPriceWei || !gas) return '';

    const totalGasCostWei = gasBigInt * gasPriceWei;
    const totalGasCostEther = formatEther(totalGasCostWei);

    return totalGasCostEther;
  }, [gasPriceWei, gas]);

  const fetchedGasFeeEstimateUsd = useUsdValue({
    address: ETH_CONTRACT_ADDRESS,
    chainId,
    amount: totalGasCostEther,
  });

  return {
    gasFeeUsd: fetchedGasFeeEstimateUsd,
  };
};

export { useGasFeeUsd };
