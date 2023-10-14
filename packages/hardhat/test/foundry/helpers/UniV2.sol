// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IUniswapV2Factory} from 'contracts/interfaces/external/IUniswapV2Factory.sol';

library UniV2TestHelpers {
  function getPair(
    address factory,
    address tokenA,
    address tokenB
  ) internal view returns (address) {
    if (tokenA > tokenB) {
      (tokenA, tokenB) = (tokenB, tokenA);
    }

    return IUniswapV2Factory(factory).getPair(tokenA, tokenB);
  }
}
