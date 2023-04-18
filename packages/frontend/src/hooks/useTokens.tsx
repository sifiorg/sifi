import { useContext } from 'react';
import { TokensContext } from '../providers/TokensProvider';

const useTokens = () => useContext(TokensContext);

export { useTokens };
