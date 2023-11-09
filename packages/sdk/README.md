# Sifi.org SDK

SDK for integrating with Sifi.org 🛸

## Install

```bash
npm install @sifi/sdk
```

## Usage

```typescript
import { Sifi } from '@sifi/sdk';

// Get a quote to swap 100 USDC to WETH
const quote = await sifi.getQuote({
  fromToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  toToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  fromAmount: '100000000',
});

// TODO: Approve `quote.approveAddress` to send `quote.fromAmount` of `quote.fromToken`

const swap = await sifi.getSwap({
  fromAddress: '0xyourwalletaddress',
  quote,
});

const tx = {
  from: swap.tx.from,
  to: swap.tx.to,
  value: swap.tx.value, // When swapping from ETH
  data: swap.tx.data,
  chainId: swap.tx.chainId,
  gasLimit: swap.tx.gasLimit,
};

const res = await sendTransaction(tx);
```

## Notes

For swaps to/from ETH, use the address `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`

## License

MIT
