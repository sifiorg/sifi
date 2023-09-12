// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IWETH} from '@uniswap/v2-periphery/contracts/interfaces/IWETH.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {LibDiamond} from '../libraries/LibDiamond.sol';
import {LibUniV2Router} from '../libraries/LibUniV2Router.sol';

contract InitUniV2Router {
  function init(address uniswapV2Router02, address uniswapV2Factory) public {
    LibUniV2Router.DiamondStorage storage s = LibUniV2Router.diamondStorage();

    if (!s.isInitialized) {
      s.isInitialized = true;
      s.uniswapV2router02 = IUniswapV2Router02(uniswapV2Router02);
      s.weth = IWETH(s.uniswapV2router02.WETH());
    }

    s.uniswapV2Factory = uniswapV2Factory;
  }
}
