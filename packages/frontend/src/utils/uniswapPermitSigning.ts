// https://github.com/Uniswap/conedison/blob/6fdf4baf13a799ca6d37f6d3222f9194e1750007/src/provider/signing.ts#L32
import type { ExternalProvider, JsonRpcProvider, Web3Provider, JsonRpcSigner } from '@ethersproject/providers'
import type WalletConnectProviderV1 from '@walletconnect/ethereum-provider-v1'
import type WalletConnectProviderV2 from '@walletconnect/ethereum-provider-v2'
import type { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { _TypedDataEncoder } from '@ethersproject/hash'

function isWeb3Provider(provider: JsonRpcProvider): provider is Web3Provider {
  return 'provider' in provider
}

type WalletConnectProvider = WalletConnectProviderV1 | WalletConnectProviderV2

function isWalletConnectProvider(provider: ExternalProvider): provider is WalletConnectProvider {
  return (provider as WalletConnectProvider).isWalletConnect
}

export enum WalletType {
  WALLET_CONNECT = 'WalletConnect',
  INJECTED = 'Injected',
}

/**
 * WalletMeta for WalletConnect or Injected wallets.
 *
 * For WalletConnect wallets, name, description, url, and icons are taken from WalletConnect's peerMeta
 * v1: @see https://docs.walletconnect.com/1.0/specs#session-request
 * v2: @see https://docs.walletconnect.com/2.0/specs/clients/core/pairing/data-structures#metadata
 *
 * For Injected wallets, the name is derived from the `is*` properties on the provider (eg `isCoinbaseWallet`).
 */
interface WalletMeta {
  type: WalletType
  /**
   * The agent string of the wallet, for use with analytics/debugging.
   * Denotes the wallet's provenance - analagous to a User String - including all `is*` properties and the type.
   *
   * Some injected wallets are used different ways (eg with/without spoofing MetaMask).
   * The agent will capture these differences, while the name will not.
   *
   * @example 'CoinbaseWallet qUrl (Injected)'
   */
  agent: string
  /**
   * The name of the wallet, for use with UI.
   *
   * @example 'CoinbaseWallet'
   */
  name?: string
  description?: string
  url?: string
  icons?: string[]
}

function getWalletConnectMeta(provider: WalletConnectProvider): WalletMeta {
  let metadata:
    | WalletConnectProviderV1['connector']['peerMeta']
    | NonNullable<WalletConnectProviderV2['session']>['peer']['metadata']
    | undefined
  if ('session' in provider) {
    metadata = provider.session?.peer.metadata
  } else {
    metadata = provider.connector.peerMeta
  }
  return {
    type: WalletType.WALLET_CONNECT,
    agent: metadata ? `${metadata.name} (WalletConnect)` : '(WalletConnect)',
    ...metadata,
  }
}

function getInjectedMeta(provider: ExternalProvider & Record<string, unknown>): WalletMeta {
  const properties = Object.getOwnPropertyNames(provider)
  const names =
    properties
      .filter((name) => name.match(/^is.*$/) && (provider as Record<string, unknown>)[name] === true)
      .map((name) => name.slice(2)) ?? []

  // Many wallets spoof MetaMask by setting `isMetaMask` along with their own identifier,
  // so we sort MetaMask last so that these wallets' names come first.
  names.sort((a, b) => (a === 'MetaMask' ? 1 : b === 'MetaMask' ? -1 : 0))

  // Coinbase Wallet can be connected through an extension or a QR code, with `qrUrl` as the only differentiator,
  // so we capture `qrUrl` in the agent string.
  if (properties.includes('qrUrl') && provider['qrUrl']) {
    names.push('qrUrl')
  }

  return {
    type: WalletType.INJECTED,
    agent: [...names, '(Injected)'].join(' '),
    name: names[0],
    // TODO(WEB-2914): Populate description, url, and icons for known wallets.
  }
}

function getWalletMeta(provider: JsonRpcProvider): WalletMeta | undefined {
  if (!isWeb3Provider(provider)) return undefined

  if (isWalletConnectProvider(provider.provider)) {
    return getWalletConnectMeta(provider.provider)
  } else {
    return getInjectedMeta(provider.provider)
  }
}

// These are WalletConnect peers which do not implement eth_signTypedData_v4, but *do* implement eth_signTypedData.
// They are special-cased so that signing will still use EIP-712 (which is safer for the user).
const WC_PEERS_LACKING_V4_SUPPORT = ['SafePal Wallet', 'Ledger Wallet Connect']

// Assumes v4 support by default, except for known wallets.
function supportsV4(provider: JsonRpcProvider): boolean {
  const meta = getWalletMeta(provider)
  if (meta) {
    const { type, name } = meta
    if (name) {
      if (type === WalletType.WALLET_CONNECT && name && WC_PEERS_LACKING_V4_SUPPORT.includes(name)) {
        return false
      }
    }
  }

  return true
}

/**
 * Signs TypedData with EIP-712, if available, or else by falling back to eth_sign.
 * Calls eth_signTypedData_v4, or eth_signTypedData for wallets with incomplete EIP-712 support.
 *
 * @see https://github.com/ethers-io/ethers.js/blob/c80fcddf50a9023486e9f9acb1848aba4c19f7b6/packages/providers/src.ts/json-rpc-provider.ts#L334
 */
async function signTypedData(
  signer: JsonRpcSigner,
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  // Use Record<string, any> for the value to match the JsonRpcSigner._signTypedData signature.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Record<string, any>
) {
  // Populate any ENS names (in-place)
  const populated = await _TypedDataEncoder.resolveNames(domain, types, value, (name: string) => {
    return signer.provider.resolveName(name) as Promise<string>
  })

  const method = supportsV4(signer.provider) ? 'eth_signTypedData_v4' : 'eth_signTypedData'
  const address = (await signer.getAddress()).toLowerCase()
  const message = JSON.stringify(_TypedDataEncoder.getPayload(populated.domain, types, populated.value))

  try {
    return await signer.provider.send(method, [address, message])
  } catch (error) {
    // If eth_signTypedData is unimplemented, fall back to eth_sign.
    if (error instanceof Error && typeof error.message === 'string' && error.message.match(/not (found|implemented)/i)) {
      console.warn('signTypedData: wallet does not implement EIP-712, falling back to eth_sign', error.message)
      const hash = _TypedDataEncoder.hash(populated.domain, types, populated.value)
      return await signer.provider.send('eth_sign', [address, hash])
    }
    throw error
  }
}

export { signTypedData };
