import Big from 'big.js';
import { useEffect, useState } from 'react';
import { useSifi } from 'src/providers/SDKProvider';

type UseUsdPriceOptions = {
  address?: string | null;
  chainId?: number | null;
  amount?: string;
};

const useUsdValue = ({ address, chainId, amount }: UseUsdPriceOptions) => {
  const [usdPrice, setUsdPrice] = useState<string>();
  const sifi = useSifi();

  const fetchUsdPrice = async () => {
    if (!address || !chainId) return;

    const response = await sifi.getUsdPrice(chainId, address);
    setUsdPrice(response.usdPrice);
  };

  useEffect(() => {
    fetchUsdPrice();
  }, [address, chainId]);

  if (!usdPrice || !amount) return '';

  return Big(Number(usdPrice) * Number(amount)).toFixed(2);
};

export { useUsdValue };
