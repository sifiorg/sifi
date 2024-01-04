import { useState, useEffect, useMemo } from 'react';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useQuote } from './useQuote';
import { useUsdValue } from './useUsdValue';
import { useSwapFormValues } from './useSwapFormValues';
import { usePublicClient } from 'wagmi';
import { formatEther } from 'viem';

const useGasFee = () => {
  const { quote } = useQuote();
  const { fromChain } = useSwapFormValues();
  const publicClient = usePublicClient({ chainId: fromChain.id });
  const [gasPriceWei, setGasPriceWei] = useState<bigint | null>(null);

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
    if (!gasPriceWei || !quote?.estimatedGas) return '';

    const totalGasCostWei = quote.estimatedGas * gasPriceWei;
    const totalGasCostEther = formatEther(totalGasCostWei);

    return totalGasCostEther;
  }, [gasPriceWei, quote?.estimatedGas]);

  const fetchedGasFeeEstimateUsd = useUsdValue({
    address: ETH_CONTRACT_ADDRESS,
    chainId: fromChain.id,
    amount: totalGasCostEther,
  });

  return {
    gasFeeEstimateUsd: quote ? fetchedGasFeeEstimateUsd : null,
  };
};

export { useGasFee };
