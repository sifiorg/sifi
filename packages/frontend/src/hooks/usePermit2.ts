// https://blog.uniswap.org/permit2-integration-guide#how-to-construct-permit2-signatures-on-the-frontend
import { AllowanceProvider, AllowanceTransfer, type PermitSingle, MaxAllowanceTransferAmount } from '@uniswap/permit2-sdk'
import { usePublicClient, useWalletClient } from 'wagmi';
import { type BigNumberish } from 'ethers';
import { publicClientToProvider, walletClientToSigner, signTypedData } from 'src/utils';
import { GetSwapOptions } from '@sifi/sdk';

const PERMIT_EXPIRATION = 1000 * 60 * 15; // 15 minutes in ms

type Permit2Params = GetSwapOptions['permit'];

// Current time + ms, expressed in seconds for EVM
const toDeadline = (expiration: number): number => Math.floor((Date.now() + expiration) / 1000);

const usePermit2 = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Unfortunately the permit2-sdk is built to only work with ethers.js currently
  const ethersProvider = publicClientToProvider(publicClient);
  const deadline = toDeadline(PERMIT_EXPIRATION);

  const constructPermitSingle = (
    tokenAddress: string,
    spenderAddress: string,
    nonce: number,
    amount: BigNumberish,
  ): PermitSingle => {  
    return {
      details: {
        token: tokenAddress,
        amount,
        expiration: deadline,
        nonce,
      },
      spender: spenderAddress,
      sigDeadline: deadline,
    };
  };

  const signPermit2 = async (permitSingle: PermitSingle, permit2Address: string): Promise<string> => {
    if (!walletClient) throw new Error('No wallet client found');

    const { domain, types, values } = AllowanceTransfer.getPermitData(permitSingle, permit2Address, publicClient.chain.id);

    const ethersSigner = walletClientToSigner(walletClient);
    const signature = await signTypedData(ethersSigner, domain, types, values);

    return signature;
  };

  type Permit2Inputs = {
    tokenAddress: string;
    userAddress: string;
    spenderAddress: string;
    permit2Address: string;
    amount: BigNumberish;
  };

  const getPermit2Params = async ({
    tokenAddress,
    userAddress,
    spenderAddress,
    permit2Address,
    amount
  }: Permit2Inputs): Promise<Permit2Params> => {
    const allowanceProvider = new AllowanceProvider(ethersProvider, permit2Address);
    const { nonce } = await allowanceProvider.getAllowanceData(tokenAddress, userAddress, spenderAddress);

    const permitSingle = constructPermitSingle(tokenAddress, spenderAddress, nonce, amount);

    const signature = await signPermit2(
      permitSingle,
      permit2Address
    );

    return {
      nonce,
      deadline,
      signature,
    }
  }

  return { getPermit2Params };
};

export { usePermit2 };
