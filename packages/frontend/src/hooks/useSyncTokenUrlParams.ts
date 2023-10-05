import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { SUPPORTED_CHAINS, getChainById } from "src/utils/chains";
import { isAddress } from "viem";
import { useSwapFormValues } from "./useSwapFormValues";
import { SwapFormKey } from "src/providers/SwapFormProvider";
import { getTokenByAddress, getTokenBySymbol } from "src/utils";
import { useTokens } from "./useTokens";

const TOKEN_ADDRESS_LENGTH = 42;
const MIN_CHAIN_ID_LENGTH = 1;
const MIN_TOKEN_PARAM_LENGTH = TOKEN_ADDRESS_LENGTH + MIN_CHAIN_ID_LENGTH;

const useSyncTokenUrlParams = () => {
  const [hasSetDefaultFromToken, setHasSetDefaultFromToken] = useState(false);
  const [hasSetDefaultToToken, setHasSetDefaultToToken] = useState(false);
  const { fromToken: fromURLParam , toToken: toURLParam } = useParams();
  const navigate = useNavigate();
  const { fromChain, toChain, toToken: toTokenSymbol, fromToken: fromTokenSymbol } = useSwapFormValues();
  const { fromTokens, toTokens } = useTokens();
  const [toToken, fromToken] = [getTokenBySymbol(toTokenSymbol, toTokens), getTokenBySymbol(fromTokenSymbol, fromTokens)];
  const { setValue } = useFormContext();

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
  };

  const defaultFromToken = getDefaultAddressAndChainId(fromURLParam);
  const defaultToToken = getDefaultAddressAndChainId(toURLParam);

  const isSynchronised = defaultFromToken.address === fromToken?.address && 
    defaultToToken.address === toToken?.address &&
    defaultFromToken.chainId === fromChain.id &&
    defaultToToken.chainId === toChain.id;

  // Set default to & from chains on mount
  useEffect(() => {
    if (!isSynchronised && defaultFromToken.chainId) {
      const defaultFromChain = getChainById(defaultFromToken.chainId);

      if (defaultFromChain) {
        setValue(SwapFormKey.FromChain, defaultFromChain)
      };
    }

    if (!isSynchronised && defaultToToken.chainId) {
      const defaultToChain = getChainById(defaultToToken.chainId);
      
      if (defaultToChain) {
        setValue(SwapFormKey.ToChain, defaultToChain);
      };
    }
  }, []);

  // Set default to & from tokens on correct tokenlist load. Run once.
  useEffect(() => {
    const tokenlistMatchesParamChainId = fromTokens[0]?.chainId === defaultFromToken.chainId;
    if (!hasSetDefaultFromToken && defaultFromToken.address && tokenlistMatchesParamChainId) {
      setValue(SwapFormKey.FromToken, getTokenByAddress(defaultFromToken.address, fromTokens));
      setHasSetDefaultFromToken(true);
    }
  }, [fromTokens]);

  useEffect(() => {
    const tokenlistMatchesParamChainId = toTokens[0]?.chainId === defaultToToken.chainId;
    if (!isSynchronised && !hasSetDefaultToToken && defaultToToken.address && tokenlistMatchesParamChainId) {
      setValue(SwapFormKey.ToToken, getTokenByAddress(defaultToToken.address, toTokens));
      setHasSetDefaultToToken(true);
    }
  }, [toTokens])

  // Update url params if the user changes the from or to token
  useEffect(() => {
    if (!isSynchronised && fromToken?.address && toToken?.address) {
      navigate(`/${fromToken.address}${fromChain.id}/${toToken.address}${toChain.id}`);
    }
  }, [fromToken, toToken]);
};

export { useSyncTokenUrlParams };
