import { TokenUsdPrice } from '@sifi/sdk';
import { showToast } from '@sifi/shared-ui';
import { useQuery } from '@tanstack/react-query';
import Big from 'big.js';
import { useEffect } from 'react';
import { useSifi } from 'src/providers/SDKProvider';

type UseUsdPriceOptions = {
  address?: string | null;
  chainId?: number | null;
  amount?: string;
};

const useUsdValue = ({ address, chainId, amount }: UseUsdPriceOptions) => {
  const sifi = useSifi();

  const fetchUsdPrice = async () => {
    if (!chainId || !address) return null;

    const data = await sifi.getUsdPrice(chainId, address);
    return data;
  };

  const { data, isError, error } = useQuery<TokenUsdPrice | null>({
    queryKey: ['usd-price', `${address}${chainId}`],
    queryFn: fetchUsdPrice,
    enabled: Boolean(address) && Boolean(amount),
  });

  useEffect(() => {
    if (isError && error instanceof Error) {
      showToast({ type: 'error', text: error.message });
    }
  }, [isError]);
  
  if (!data?.usdPrice || !amount) return '';

  return Big(Number(data.usdPrice) * Number(amount)).toFixed(2);
};

export { useUsdValue };
