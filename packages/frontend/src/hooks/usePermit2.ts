// https://blog.uniswap.org/permit2-integration-guide#how-to-construct-permit2-signatures-on-the-frontend
import { AllowanceProvider, PERMIT2_ADDRESS, type PermitSingle, MaxAllowanceTransferAmount } from '@uniswap/permit2-sdk'
import { usePublicClient } from 'wagmi';
import { publicClientToProvider } from 'src/utils';

const PERMIT_EXPIRATION = 1000 * 60 * 60 * 24 * 30; // 30 days in ms
const PERMIT_SIG_EXPIRATION = 1000 * 60 * 30; // 30 minutes in ms

// Current time + ms, expressed in seconds for EVM
const toDeadline = (expiration: number): number => Math.floor((Date.now() + expiration) / 1000);

const usePermit2 = () => {
  const publicClient = usePublicClient();

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

  return { constructPermitSingle };
};

export { usePermit2 };
