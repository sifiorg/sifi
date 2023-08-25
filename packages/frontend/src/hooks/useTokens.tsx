import { useContext } from 'react';
import { TokensContext } from 'src/providers/TokensProvider';

const useTokens = () => useContext(TokensContext);

export { useTokens };
