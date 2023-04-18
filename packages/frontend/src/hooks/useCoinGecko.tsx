import axios from 'axios';
import type { Token } from '@lifi/sdk';

export const coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3';

const useCoinGecko = () => {
  const getTokenByAddress = async (address: `0x${string}`): Promise<Token | null> => {
    const coinGeckoEndpoint = `${coinGeckoBaseUrl}/coins/etheruem/contract/${address}`;
    const { data } = await axios.get(coinGeckoEndpoint);

    if (!data) return null;

    return {
      address: address.toLowerCase(),
      chainId: 1,
      decimals: data.detail_platforms?.ethereum?.decimal_place,
      name: data.name,
      symbol: data.symbol?.toUpperCase(),
      logoURI: data.image?.small,
      priceUSD: data.market_data?.current_price?.usd,
    };
  };

  return { getTokenByAddress };
};

export { useCoinGecko };
