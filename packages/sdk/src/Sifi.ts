import { serializeJson } from './helpers';

// From @uniswap/token-lists/dist/types.d.ts
export type Token = {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI?: string;
};
export type GetQuoteOptions = {
  /**
   * The Chain ID of the chain to swap from. Defaults to 1 (Ethereum mainnet).
   */
  fromChain?: number;
  fromToken: string;
  /**
   * The Chain ID of the chain to swap to. Defaults to `fromChain`.
   */
  toChain?: number;
  toToken: string;
  fromAmount: bigint | string;
};

type QuoteSifiActionBase<Type extends string> = {
  type: Type;
  fromToken: string;
  toToken: string;
};

export type QuoteSifiWarpUniV2Action = QuoteSifiActionBase<'warpUniV2'> & {
  pools: string[]; // Included because WarpLink has no UniV2 command yet
  tokens: string[]; // From token, ...intermediary tokens, to token
  exchange: 'UniswapV2';
};

export type QuoteSifiWarpUniV2LikeAction = QuoteSifiActionBase<'warpUniV2Like'> & {
  pools: string[];
  poolFeesBps: bigint[];
  tokens: string[]; // From token, ...intermediary tokens, to token
  exchange: string;
};

export type QuoteSifiWarpUniV3LikeAction = QuoteSifiActionBase<'warpUniV3Like'> & {
  pools: string[];
  tokens: string[]; // From token, ...intermediary tokens, to token
  exchange: string;
};

export type QuoteSifiWarpCurveAction = QuoteSifiActionBase<'warpCurve'> & {
  kind: number;
  pool: string;
  fromTokenIndex: number; // i
  toTokenIndex: number; // j
  underlying: boolean;
  exchange: string;
};

export type QuoteSifiSplitAction = QuoteSifiActionBase<'split'> & {
  parts: QuoteSifiElement[];
};

export type QuoteSifiJumpStargateAction = QuoteSifiActionBase<'jumpStargate'> & {
  dstChainId: number;
  srcPoolId: number;
  dstPoolId: number;
  /**
   * Amount of native tokens required to pay the LayerZero, and optionally the gas
   * fee to engage WarpLink on the other chain. Obtained with `IStargateComposer.quoteLayerZeroFee`
   */
  lzFee?: bigint;
  /**
   * Optional post-jump WarpLink engage parameters
   */
  dstWarpLinkEngage?: {
    /**
     * Actions to run after jumping to the destination chain
     */
    element: QuoteSifiElement;
    /**
     * Quoted output amount after running the post-jump WarpLink engage
     */
    amountOut: bigint;
    gasForCall?: bigint;
  };
  exchange: 'Stargate';
};

export type QuoteSifiElement = {
  shareBps: bigint;
  fromToken: string;
  toToken: string;
  actions: EitherQuoteSifiAction[];
};

export type QuoteSifiWarpWoofiV2Action = QuoteSifiActionBase<'warpWooFiV2'> & {
  pools: string[];
};

export type QuoteSifiWarpBalancerV2Action = QuoteSifiActionBase<'warpBalancerV2'> & {
  pools: string[];
  poolIds: string[];
};

export type QuoteSifiWarpNerveAction = QuoteSifiActionBase<'warpNerve'> & {
  tokenIndexFrom: number;
  tokenIndexTo: number;
  router: string;
};

export type EitherQuoteSifiAction =
  | QuoteSifiWarpUniV2Action
  | QuoteSifiWarpUniV2LikeAction
  | QuoteSifiSplitAction
  | QuoteSifiWarpUniV3LikeAction
  | QuoteSifiWarpCurveAction
  | QuoteSifiJumpStargateAction
  | QuoteSifiWarpWoofiV2Action
  | QuoteSifiWarpBalancerV2Action
  | QuoteSifiWarpNerveAction;

export const sifiContractMethod = {
  uniswapV2ExactInputSingle: 'uniswapV2ExactInputSingle',
  uniswapV2ExactInput: 'uniswapV2ExactInput',
  uniswapV2LikeExactInputSingle: 'uniswapV2LikeExactInputSingle',
  uniswapV2LikeExactInput: 'uniswapV2LikeExactInput',
  uniswapV3LikeExactInputSingle: 'uniswapV3LikeExactInputSingle',
  uniswapV3LikeExactInput: 'uniswapV3LikeExactInput',
  curveExactInputSingle: 'curveExactInputSingle',
  stargateJumpNative: 'stargateJumpNative',
  stargateJumpToken: 'stargateJumpToken',
  warpLinkEngage: 'warpLinkEngage',
  warpStateless: 'warpStateless',
} as const;

export type SifiContractMethod = (typeof sifiContractMethod)[keyof typeof sifiContractMethod];

export type QuoteSifi = {
  contractMethod: SifiContractMethod;
  element: QuoteSifiElement;
};

export type QuoteSource =
  | {
      name: 'sifi';
      quote: QuoteSifi;
    }
  | {
      name: 'paraswap';
      quote: {};
    };

export type Quote = {
  fromAmount: bigint;
  fromToken: Token;
  toToken: Token;
  toAmount: bigint;
  estimatedGas: bigint;
  source: QuoteSource;
  /**
   * The address of the Permit2 contract to use, or undefined if not using Permit2 or if moving the native token.
   */
  permit2Address?: string;
  /**
   * The address to approve for moving tokens, or undefined if moving the native token
   *
   * When `permit2Address` is set, this is the spender to use for the permit.
   * Else, this is the spender to use for the ERC20 approve.
   */
  approveAddress?: string;
  toAmountAfterFeesUsd: string;
};

export type GetSwapOptions = {
  /**
   * Quote object from `getQuote`
   */
  quote: Quote;
  /**
   * Address of the token to swap from.
   */
  fromAddress: string;
  /**
   * Slippage as fraction of 1 (e.g. 0.005 for 0.5%)
   */
  slippage?: number;
  /**
   * Recipient of swapped tokens. Defaults to `fromAddress`.
   */
  toAddress?: string;
  /**
   * Partner address (0xdeadbeef...)
   */
  partner?: string;
  /**
   * Fee in basis points (e.g. 25 for 0.25%). The fee is split evenly between the partner
   * and SIFI. Defaults to 0, meaning no fee is charged.
   */
  feeBps?: number;
  /**
   * The permit to use to transfer the tokens
   *
   * When `permit2Address` is set on the quote, this field is required
   *
   * See https://blog.uniswap.org/permit2-integration-guide for more information
   */
  permit?: {
    nonce: number | bigint;
    deadline: number | bigint;
    signature: string;
  };
};

export type Swap = {
  tx: {
    /**
     * Address with checksum
     */
    from: string;
    /**
     * Address with checksum
     */
    to: string;
    /**
     * Value as hex string, e.g. `0x0` when swapping from the native token
     */
    value?: string;
    /**
     * Data as hex string, e.g. `0xdeadbeef`
     */
    data: string;
    /**
     * Chain ID as number, e.g. `1` for Ethereum mainnet
     */
    chainId: number;
    /**
     * Gas price as hex string, e.g. `0x030d40`
     */
    gasLimit: string;
  };
  estimatedGasTotalUsd: string;
};

export type GetTokensOptions = {
  chainId: number;
};

export type TokenUsdPrice = {
  usdPrice: string;
};

export type JumpStatus = 'pending' | 'inflight' | 'success' | 'unknown';

export type Jump = {
  status: JumpStatus;
  txhash?: string;
};

export class SifiError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'SifiError';
  }
}

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');

  if (response.ok) {
    if (!contentType?.startsWith('application/json')) {
      throw new SifiError(`Unexpected response content type: ${contentType ?? '<none>'}`);
    }

    return await response.json();
  }

  if (contentType?.startsWith('application/json')) {
    const json = (await response.json()) as { code: string; message: string };

    throw new SifiError(json.message, json.code);
  }

  throw new SifiError(`Request failed: ${response.statusText}`);
}

/**
 * Placeholder address used to represent the native token.
 */
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export class Sifi {
  constructor(private readonly baseUrl = 'https://api.sifi.org/v1/') {}

  async getQuote(options: GetQuoteOptions): Promise<Quote> {
    const params: Record<string, string> = {
      fromToken: options.fromToken,
      toToken: options.toToken,
      fromAmount: options.fromAmount.toString(),
    };

    if (options.fromChain !== undefined) {
      params.fromChain = options.fromChain.toString();
    }

    if (options.toChain !== undefined) {
      params.toChain = options.toChain.toString();
    }

    const query = new URLSearchParams(params).toString();

    const response = (await fetch(`${this.baseUrl}quote?${query}`).then(handleResponse)) as Quote;

    return {
      fromAmount: BigInt(response.fromAmount),
      fromToken: response.fromToken,
      toToken: response.toToken,
      toAmount: BigInt(response.toAmount),
      estimatedGas: BigInt(response.estimatedGas),
      approveAddress: response.approveAddress,
      permit2Address: response.permit2Address,
      toAmountAfterFeesUsd: response.toAmountAfterFeesUsd,
      source: response.source,
    };
  }

  async getSwap(options: GetSwapOptions): Promise<Swap> {
    const response = await fetch(`${this.baseUrl}swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: serializeJson(options),
    }).then(handleResponse);
    return {
      tx: response.tx,
      estimatedGasTotalUsd: response.estimatedGasTotalUsd,
    };
  }

  async getToken(chainId: number, address: string): Promise<Token> {
    const query = new URLSearchParams({
      chainId: chainId.toString(),
      address,
    });

    const response = await fetch(`${this.baseUrl}token?${query}`).then(handleResponse);

    return response;
  }

  async getTokens(options: number | GetTokensOptions): Promise<Token[]> {
    if (typeof options === 'number') {
      options = { chainId: options };
    }

    const query = new URLSearchParams({
      chainId: options.chainId.toString(),
    }).toString();

    const response = await fetch(`${this.baseUrl}tokens?${query}`).then(handleResponse);

    return response;
  }

  async getUsdPrice(chainId: number, address: string): Promise<TokenUsdPrice> {
    const query = new URLSearchParams({
      chainId: chainId.toString(),
      address,
    });

    const response = await fetch(`${this.baseUrl}token/usd-price?${query}`).then(handleResponse);

    return response;
  }

  async getJump(txhash: string): Promise<Jump> {
    const query = new URLSearchParams({
      txhash,
    });

    const response = await fetch(`${this.baseUrl}jump?${query}`).then(handleResponse);

    return response;
  }
}
