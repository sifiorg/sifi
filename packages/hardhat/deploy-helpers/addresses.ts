type AddressKey =
  | 'uniswapV2Router02'
  | 'uniswapV2Factory'
  | 'weth'
  | 'permit2'
  | 'stargateComposer';

export const networkAddresses: Partial<Record<string, Partial<Record<AddressKey, string>>>> = {
  mainnet: {
    uniswapV2Router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateComposer: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
  },
  goerli: {
    uniswapV2Router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    weth: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateComposer: '0x7C5B3F4865b41b9d2B6dE65fdfbB47af06AC41f0',
  },
  optimismGoerli: {
    weth: '0x4200000000000000000000000000000000000006',
    stargateComposer: '0xb82E8737e7BA953CB4462561639f32Fd7F0974c4',
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
    stargateComposer: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
  },
  arbitrum: {
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateComposer: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
  },
  optimism: {
    weth: '0x4200000000000000000000000000000000000006',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateComposer: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
  },
  avalanche: {
    weth: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateComposer: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
  },
  base: {
    weth: '0x4200000000000000000000000000000000000006',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateComposer: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
  },
  bsc: {
    weth: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    stargateComposer: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
  },
};
