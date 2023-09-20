// https://blog.uniswap.org/permit2-integration-guide#how-to-construct-permit2-signatures-on-the-frontend
import { AllowanceProvider, AllowanceTransfer, PERMIT2_ADDRESS, type PermitSingle, MaxAllowanceTransferAmount } from '@uniswap/permit2-sdk'
import { usePublicClient, useWalletClient } from 'wagmi';
import { publicClientToProvider, walletClientToSigner } from 'src/utils';
import { GetSwapOptions } from '@sifi/sdk';

const PERMIT_EXPIRATION = 1000 * 60 * 60 * 24 * 30; // 30 days in ms
const PERMIT_SIG_EXPIRATION = 1000 * 60 * 30; // 30 minutes in ms

type Permit2Params = GetSwapOptions['permit'];

// Current time + ms, expressed in seconds for EVM
const toDeadline = (expiration: number): number => Math.floor((Date.now() + expiration) / 1000);

const getLocalStorageSignatureKey = (tokenAddress: string, userAddress: string, chainId: number): string => {
  return `sifi-permit-2-${tokenAddress}-${userAddress}-${chainId}`;
};

const storeSignatureInLocalStorage = (signature: string, tokenAddress: string, userAddress: string, chainId: number): void => {
  localStorage.setItem(
    getLocalStorageSignatureKey(tokenAddress, userAddress, chainId), signature
  );
};

const loadSignatureFromLocalStorage = (tokenAddress: string, userAddress: string, chainId: number): string | null => {
  return localStorage.getItem(
    getLocalStorageSignatureKey(tokenAddress, userAddress, chainId)
  );
};

const usePermit2 = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Unfortunately the permit2-sdk is built to only work with ethers.js currently
  const ethersProvider = publicClientToProvider(publicClient);

  const constructPermitSingle = (
    tokenAddress: string,
    spenderAddress: string,
    nonce: number
  ): PermitSingle => {  
    return {
      details: {
        token: tokenAddress,
        amount: MaxAllowanceTransferAmount,
        expiration: toDeadline(PERMIT_EXPIRATION),
        nonce,
      },
      spender: spenderAddress,
      sigDeadline: toDeadline(PERMIT_SIG_EXPIRATION),
    };
  };

  const signPermit2 = async (permitSingle: PermitSingle, permit2Address: string): Promise<string> => {
    if (!walletClient) throw new Error('No wallet client found');

    const { domain, types, values } = AllowanceTransfer.getPermitData(permitSingle, permit2Address, publicClient.chain.id);

    const ethersSigner = walletClientToSigner(walletClient);
    const signature = await ethersSigner._signTypedData(domain, types, values);

    return signature;
  };

  type Permit2Addresses = {
    tokenAddress: string;
    userAddress: string;
    spenderAddress: string;
    permit2Address: string;
  };

  const getPermit2Params = async ({
    tokenAddress,
    userAddress,
    spenderAddress,
    permit2Address,
  }: Permit2Addresses): Promise<Permit2Params> => {
    const allowanceProvider = new AllowanceProvider(ethersProvider, permit2Address);
    const { nonce, expiration } = await allowanceProvider.getAllowanceData(tokenAddress, userAddress, spenderAddress);

    const permitSingle = constructPermitSingle(tokenAddress, spenderAddress, nonce);

    // TODO: check units of `expiration`
    const permitHasExpired = (expiration * 1000) < Date.now();

    const storedSignature = loadSignatureFromLocalStorage(tokenAddress, userAddress, publicClient.chain.id);
    const shouldUseStoredSignature = storedSignature && !permitHasExpired;

    const signature = shouldUseStoredSignature ? storedSignature : await signPermit2(
      permitSingle,
      permit2Address
    );

    storeSignatureInLocalStorage(signature, tokenAddress, userAddress, publicClient.chain.id)

    return {
      nonce,
      deadline: permitHasExpired ? toDeadline(PERMIT_EXPIRATION) : expiration,
      signature,
    }
  }

  return { getPermit2Params };
};

export { usePermit2 };
