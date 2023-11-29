import { Token } from '@sifi/sdk';
import { getTokenBySymbol } from './tokens';
import MissingTokenIcon from 'src/assets/icons/missing-token-icon.svg';

const getIconFromSymbol = (symbol: string, tokens: Token[]) => {
  if (!symbol) return MissingTokenIcon;

  let logoURI = getTokenBySymbol(symbol, tokens)?.logoURI;

  // Symbol from the SDK is sometimes inconsistent
  if (!logoURI) {
    const processedSymbol = symbol.includes('.')
      ? symbol.split('.')[0].toUpperCase()
      : symbol.toUpperCase();
    logoURI = getTokenBySymbol(processedSymbol, tokens)?.logoURI;
  }
  return logoURI || MissingTokenIcon;
};

export { getIconFromSymbol };
