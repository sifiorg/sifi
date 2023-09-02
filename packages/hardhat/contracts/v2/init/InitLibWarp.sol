// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {IWETH} from '@uniswap/v2-periphery/contracts/interfaces/IWETH.sol';
import {LibWarp} from '../libraries/LibWarp.sol';

contract InitLibWarp {
  function init(address weth) public {
    LibWarp.State storage s = LibWarp.state();

    s.weth = IWETH(weth);
  }
}
