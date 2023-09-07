// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IUniswapV3Pool} from '../interfaces/external/IUniswapV3Pool.sol';
import {LibUniV3Like} from '../libraries/LibUniV3Like.sol';

interface IUniV3Callback {
  error SwapWithinZeroLiquidityRegion();
  error InvalidCallbackSender();

  struct SwapCallbackData {
    address payer;
    address tokenIn;
  }
}
