# DEXRouterV2

This project routes orders to the main DEXs and forked version of those projects whilst also allowing bridging cross-chain. Orders can be split to gain optimal fill rates, sent cross-DEX, multi-hop, and bridge in a single transaction.

Each order requires the bytes input to be constructed correctly for each order type along with the correct command in bytes. The usage of bytes reduces gas costs from input parameters and through bytes manipulation we can customise the inputs used to call external contracts.

The DEXs supported are:

- Uniswap V2 (incl. forks)
- Uniswap V3 (incl. forks)
- Curve
- Balancer (incl. forks)
- Bancor

The cross-chain bridges supported are:

- Hop
- Arbitrum Bridge
- Optimism Bridge
