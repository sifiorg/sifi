type AddressKey = 'uniswapV2Router02' | 'uniswapV2Factory' | 'weth';

export const networkAddresses: Partial<Record<string, Record<AddressKey, string>>> = {
  mainnet: {
    uniswapV2Router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  sepolia: {
    uniswapV2Router02: '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008',
    uniswapV2Factory: '0x7E0987E5b3a30e3f2828572Bb659A548460a3003',
    weth: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  },
};
