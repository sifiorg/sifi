import { useState, useEffect } from 'react';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useQuote } from './useQuote';
import { useUsdValue } from './useUsdValue';
import { useSwapFormValues } from './useSwapFormValues';
import { usePublicClient } from 'wagmi';

const useGasFee = () => {
  const { quote } = useQuote();
  const { fromChain } = useSwapFormValues();
  const publicClient = usePublicClient({ chainId: fromChain.id });
  const [gasPriceWei, setGasPriceWei] = useState<bigint | null>(null);
  const [gasFeeEstimateUsd, setGasFeeEstimateUsd] = useState<string | null>(null);

  useEffect(() => {
    const getGasPrice = async () => {
      const gasPrice = await publicClient.getGasPrice();

      setGasPriceWei(gasPrice);
    };

    getGasPrice();
  }, [publicClient]);

  const getTotalGasCostEther = () => {
    if (!gasPriceWei || !quote?.estimatedGas) return null;

    const totalGasCostWei = quote.estimatedGas * gasPriceWei;
    const totalGasCostEther = Number(totalGasCostWei) / 1e18;

    return totalGasCostEther;
  };

  const fetchedGasFeeEstimateUsd = useUsdValue({
    address: ETH_CONTRACT_ADDRESS,
    chainId: fromChain.id,
    amount: String(getTotalGasCostEther() || ''),
  });

  useEffect(() => {
    setGasFeeEstimateUsd(fetchedGasFeeEstimateUsd);
  }, [quote]);

  return {
    gasFeeEstimateUsd: quote ? gasFeeEstimateUsd : null,
  };
};

export { useGasFee };
