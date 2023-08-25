export type GetQuoteOptions = {
  fromToken: string;
  toToken: string;
  fromAmount: bigint | string;
};

export type Quote = {
  id: string;
  toAmount: bigint;
  estimatedGas: bigint;
  approveAddress: string;
  toAmountAfterFeesUsd: string;
};

export type GetSwapOptions = {
  /**
   * Quote ID or Quote object.
   */
  quote: Quote | string;
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
};

export type Swap = {
  tx: {
    from: string;
    to: string;
    value: string;
    data: string;
    chainId: number;
    gasLimit: string;
  };
  estimatedGasTotalUsd: string;
};

export type GetTokensOptions = {
  chainId: number;
};

// From @uniswap/token-lists/dist/types.d.ts
export type Token = {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI?: string;
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

export class Sifi {
  constructor(private readonly baseUrl = 'https://api.sideshift.fi/v1/') {}

  async getQuote(options: GetQuoteOptions): Promise<Quote> {
    const query = new URLSearchParams({
      fromToken: options.fromToken,
      toToken: options.toToken,
      fromAmount: options.fromAmount.toString(),
    }).toString();

    const response = (await fetch(`${this.baseUrl}quote?${query}`).then(handleResponse)) as any;

    return {
      id: response.id,
      toAmount: BigInt(response.toAmount),
      estimatedGas: BigInt(response.estimatedGas),
      approveAddress: response.approveAddress,
      toAmountAfterFeesUsd: response.toAmountAfterFeesUsd,
    };
  }

  async getSwap(options: GetSwapOptions): Promise<Swap> {
    const params: Record<string, string> = {
      quoteId: typeof options.quote === 'string' ? options.quote : options.quote.id,
      fromAddress: options.fromAddress,
    };

    if (options.toAddress !== undefined) {
      params.toAddress = options.toAddress;
    }

    if (options.slippage !== undefined) {
      params.slippage = options.slippage.toString();
    }

    if (options.partner !== undefined) {
      params.partner = options.partner;
    }

    if (options.feeBps !== undefined) {
      params.feeBps = options.feeBps.toString();
    }

    const query = new URLSearchParams(params).toString();

    const response = (await fetch(`${this.baseUrl}swap?${query}`).then(handleResponse)) as any;

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
}
