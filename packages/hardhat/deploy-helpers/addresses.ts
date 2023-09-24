type AddressKey = 'uniswapV2Router02' | 'uniswapV2Factory' | 'weth' | 'permit2' | 'stargateRouter';

export const networkAddresses: Partial<Record<string, Partial<Record<AddressKey, string>>>> = {
  mainnet: {
    uniswapV2Router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateRouter: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
  },
  goerli: {
    uniswapV2Router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    weth: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateRouter: '0x7612aE2a34E5A363E137De748801FB4c86499152',
  },
  sepolia: {
    uniswapV2Router02: '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008',
    uniswapV2Factory: '0x7E0987E5b3a30e3f2828572Bb659A548460a3003',
    weth: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
  polygon: {
    weth: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateRouter: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
  },
  arbitrum: {
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateRouter: '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614',
  },
  optimism: {
    weth: '0x4200000000000000000000000000000000000006',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateRouter: '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614',
  },
};
