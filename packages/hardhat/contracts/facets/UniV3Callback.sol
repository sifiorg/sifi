// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IUniswapV3Pool} from '../interfaces/external/IUniswapV3Pool.sol';
import {LibUniV3Like} from '../libraries/LibUniV3Like.sol';
import {IUniV3Callback} from '../interfaces/IUniV3Callback.sol';

contract UniV3Callback is IUniV3Callback {
  using SafeERC20 for IERC20;

  /**
   * See https://github.com/Uniswap/v3-periphery/blob/main/contracts/SwapRouter.sol
   */
  function uniswapV3SwapCallback(
    int256 amount0Delta,
    int256 amount1Delta,
    bytes calldata data
  ) external {
    if (amount0Delta < 0 && amount1Delta < 0) {
      revert SwapWithinZeroLiquidityRegion();
    }

    if (msg.sender != LibUniV3Like.state().callbackPool) {
      revert InvalidCallbackSender();
    }

    LibUniV3Like.state().callbackPool = address(0);

    SwapCallbackData memory decoded = abi.decode(data, (SwapCallbackData));

    uint256 amountToPay = amount0Delta > 0 ? uint256(amount0Delta) : uint256(amount1Delta);

    if (decoded.payer == address(this)) {
      IERC20(decoded.tokenIn).safeTransfer(msg.sender, amountToPay);
    } else {
      IERC20(decoded.tokenIn).safeTransferFrom(decoded.payer, msg.sender, amountToPay);
    }
  }
}
