import { TokenUsdPrice } from '@sifi/sdk';
import { showToast } from '@sifi/shared-ui';
import { useQuery } from '@tanstack/react-query';
import Big from 'big.js';
import { useSifi } from 'src/providers/SDKProvider';

type UseUsdPriceOptions = {
  address?: string | null;
  chainId?: number | null;
  amount?: string;
};

const useUsdValue = ({ address, chainId, amount }: UseUsdPriceOptions) => {
  const sifi = useSifi();
  const { data } = useQuery<TokenUsdPrice | null>(
    ['usd-price', `${address}${chainId}`],
    async () => {
      if (!chainId || !address) return null;

      const data = await sifi.getUsdPrice(chainId, address);
      return data;
    },
    {
      onError: error => {
        if (error instanceof Error) {
          showToast({ type: 'error', text: error.message });
        }
      },
      enabled: Boolean(address) && Boolean(amount),
    }
  );

  if (!data?.usdPrice || !amount) return '';

  return Big(Number(data.usdPrice) * Number(amount)).toFixed(2);
};

export { useUsdValue };
