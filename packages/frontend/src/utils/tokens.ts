import type { Token } from '@sifi/sdk';
import { POPULAR_TOKEN_SYMBOLS } from '../constants';

export const getOrderedTokenList = (tokenList: Token[]) => {
  const popularTokenList = tokenList.filter(token => POPULAR_TOKEN_SYMBOLS.includes(token.symbol));
  const restOfTokenList = tokenList.filter(token => !POPULAR_TOKEN_SYMBOLS.includes(token.symbol));

  const sortedPopularTokenList = popularTokenList.sort((a, b) => {
    return POPULAR_TOKEN_SYMBOLS.indexOf(a.symbol) - POPULAR_TOKEN_SYMBOLS.indexOf(b.symbol);
  });

  return [...sortedPopularTokenList, ...restOfTokenList];
};

export const getTokenBySymbol = (symbol: string, tokenList: Token[]) => {
  if (!tokenList) return null;

  return tokenList.find(token => token.symbol === symbol) || null;
};
