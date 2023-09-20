// https://blog.uniswap.org/permit2-integration-guide#how-to-construct-permit2-signatures-on-the-frontend
import { AllowanceProvider, AllowanceTransfer, PERMIT2_ADDRESS, type PermitSingle, MaxAllowanceTransferAmount } from '@uniswap/permit2-sdk'
import { usePublicClient, useWalletClient } from 'wagmi';
import { publicClientToProvider, walletClientToSigner } from 'src/utils';

const PERMIT_EXPIRATION = 1000 * 60 * 60 * 24 * 30; // 30 days in ms
const PERMIT_SIG_EXPIRATION = 1000 * 60 * 30; // 30 minutes in ms

// Current time + ms, expressed in seconds for EVM
const toDeadline = (expiration: number): number => Math.floor((Date.now() + expiration) / 1000);

const usePermit2 = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Unfortunately the permit2-sdk is built to only work with ethers.js currently
  const ethersProvider = publicClientToProvider(publicClient);
  const allowanceProvider = new AllowanceProvider(ethersProvider, PERMIT2_ADDRESS);

  const constructPermitSingle = async (tokenAddress: string, user: string, spenderAddress: string): Promise<PermitSingle> => {
    const { nonce } = await allowanceProvider.getAllowanceData(tokenAddress, user, spenderAddress);
  
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

  const signPermit2 = async (tokenAddress: string, user: string, spenderAddress: string): Promise<string> => {
    if (!walletClient) throw new Error('No wallet client found');
  
    const permitSingle = await constructPermitSingle(tokenAddress, user, spenderAddress);
    const { domain, types, values } = AllowanceTransfer.getPermitData(permitSingle, PERMIT2_ADDRESS, publicClient.chain.id);

    const ethersSigner = walletClientToSigner(walletClient);
    const signature = await ethersSigner._signTypedData(domain, types, values);

    return signature;
  };

  return { constructPermitSingle, signPermit2 };
};

export { usePermit2 };
