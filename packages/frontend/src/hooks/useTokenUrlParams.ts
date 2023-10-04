import { useParams } from "react-router-dom";
import { SUPPORTED_CHAINS } from "src/utils/chains";
import { isAddress } from "viem";

const TOKEN_ADDRESS_LENGTH = 42;
const MIN_CHAIN_ID_LENGTH = 1;
const MIN_TOKEN_PARAM_LENGTH = TOKEN_ADDRESS_LENGTH + MIN_CHAIN_ID_LENGTH;

const useTokenUrlParams = () => {
  const { fromToken: fromURLParam , toToken: toURLParam } = useParams();

  const getAddressAndChainIdFromParam = (tokenParam: string): { address: `0x${string}`, chainId: number } => {
    const [address, chainId] = [tokenParam.slice(0, TOKEN_ADDRESS_LENGTH), tokenParam.slice(TOKEN_ADDRESS_LENGTH)];

    // Typeguard
    if (!isAddress(address)) throw new Error('Invalid address');

    return { address, chainId: Number(chainId) };
  };

  const isValidTokenParam = (tokenParam?: string): boolean => {
    if (!tokenParam) return false;
    if (tokenParam.length < MIN_TOKEN_PARAM_LENGTH) return false;

    const { address, chainId } = getAddressAndChainIdFromParam(tokenParam);
  
    if (!isAddress(address)) return false;
  
    if (!Boolean(SUPPORTED_CHAINS.find((chain) => chain.id === Number(chainId)))) return false;

    return true;
  }

  const getDefaultAddressAndChainId = (urlParam?: string) => {
    if (!urlParam || !isValidTokenParam(urlParam)) return { address: null, chainId: null };

    return getAddressAndChainIdFromParam(urlParam);
  }


  return { defaultFromToken: getDefaultAddressAndChainId(fromURLParam), defaultToToken: getDefaultAddressAndChainId(toURLParam) }
};

export { useTokenUrlParams };
