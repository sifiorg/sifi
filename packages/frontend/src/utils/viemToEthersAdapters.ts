import { type PublicClient } from '@wagmi/core'
import { providers } from 'ethers'
import { WalletClient, type HttpTransport } from 'viem'

// https://wagmi.sh/core/ethers-adapters#public-client--provider
const publicClientToProvider = (publicClient: PublicClient) => {
  const { chain, transport } = publicClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    )
  return new providers.JsonRpcProvider(transport.url, network)
};

// https://wagmi.sh/core/ethers-adapters#wallet-client--signer
const walletClientToSigner = (walletClient: WalletClient) => {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain?.id || 1,
    name: chain?.name || 'mainnet',
    ensAddress: chain?.contracts?.ensRegistry?.address,
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account?.address)
  return signer
}

export { publicClientToProvider, walletClientToSigner };
