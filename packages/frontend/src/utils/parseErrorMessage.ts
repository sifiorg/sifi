import { Token } from "@sifi/sdk";

const parseErrorMessage = (message: string) => {
  if (message.toLowerCase().includes('user rejected the request')) {
    return 'You rejected the transaction';
  }

  return message;
};

type SifiErrorOptions = {
  fromToken: Token | null;
  toToken: Token | null;
};

const parseSifiErrorMessage = (message: string, sifiErrorOptions?: SifiErrorOptions) => {
  const { fromToken, toToken } = sifiErrorOptions || {};
  const pairName = (fromToken && toToken) ? `${fromToken.symbol}/${toToken.symbol}` : 'pair';

  if (message.toLowerCase().includes('failed to produce a quote')) {
    return `No quote available for ${pairName}. Please try a different amount, network or token.`
  }

  return message;
}

export { parseErrorMessage, parseSifiErrorMessage };
