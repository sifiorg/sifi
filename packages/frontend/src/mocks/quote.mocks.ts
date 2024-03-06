import { Quote } from '@sifi/sdk';
import { mockTokens } from './tokens.mock';

const mockQuote: Quote = {
  fromAmount: '1000000000000000000',
  toAmount: '2200000000',
  fromToken: mockTokens.tokens[1][0],
  toToken: mockTokens.tokens[1][1],
  estimatedGas: 21000,
  source: {
    name: 'sifi',
    quote: {
      element: {
        fromToken: '0x50b7545627a5162f82a992c33b87adc75187b218',
        shareBps: '10000',
        toToken: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
        actions: [
          {
            type: 'warpUniV2Like',
            exchange: 'UniswapV2',
            tokens: [
              '0x50b7545627a5162f82a992c33b87adc75187b218',
              '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
            ],
            pools: ['0x9D86243Ae7008Ec1F9CcE83c49D76f7A557B80cf'],
            poolFeesBps: ['30'],
            fromToken: '0x50b7545627a5162f82a992c33b87adc75187b218',
            toToken: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
          },
          {
            type: 'warpUniV3Like',
            exchange: 'UniswapV3',
            tokens: [
              '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
              '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
            ],
            pools: ['0x804226ca4edb38e7ef56d16d16e92dc3223347a0'],
            fromToken: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
            toToken: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
          },
          {
            type: 'jumpStargate',
            exchange: 'Stargate',
            fromToken: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
            toToken: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
            dstChainId: 110,
            srcPoolId: 2,
            dstPoolId: 2,
            lzFee: '137098259717672522',
            dstWarpLinkEngage: {
              gasForCall: '475750',
              amountOut: '95549774',
              element: {
                shareBps: '10000',
                fromToken: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
                toToken: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
                actions: [
                  {
                    type: 'warpUniV3Like',
                    exchange: 'UniswapV3',
                    tokens: [
                      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
                      '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
                    ],
                    pools: ['0xbe3ad6a5669dc0b8b12febc03608860c31e2eef6'],
                    fromToken: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
                    toToken: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
                  },
                ],
              },
            },
          },
        ],
      },
      contractMethod: 'warpLinkEngage',
    },
  },
  toAmountAfterFeesUs: '2190000000',
} as any;

export { mockQuote };
