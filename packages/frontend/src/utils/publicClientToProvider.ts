import { type PublicClient, getPublicClient } from '@wagmi/core'
import { providers } from 'ethers'
import { type HttpTransport } from 'viem'

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

export { publicClientToProvider };
