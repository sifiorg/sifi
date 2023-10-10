// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {LibUniV3Like} from '../libraries/LibUniV3Like.sol';
import {LibWarp} from '../libraries/LibWarp.sol';
import {IUniV3Callback} from '../interfaces/IUniV3Callback.sol';
import {IPermit2} from '../interfaces/external/IPermit2.sol';

/**
 * NOTE: Using a shared internal functions uses about 3K more gas than
 * having two externals with the code duplicated
 */
contract UniV3Callback is IUniV3Callback {
  using SafeERC20 for IERC20;

  function swapCallback() private {
    if (LibUniV3Like.state().isActive != 1) {
      revert CallbackInactive();
    }

    LibUniV3Like.CallbackState memory callback = LibUniV3Like.state().callback;

    if (callback.payer == address(this)) {
      IERC20(callback.token).safeTransfer(msg.sender, callback.amount);
    } else {
      LibWarp.state().permit2.transferFrom(
        callback.payer,
        msg.sender,
        (uint160)(callback.amount),
        callback.token
      );
    }

    LibUniV3Like.state().isActive = 0;
  }

  /**
   * See https://github.com/Uniswap/v3-periphery/blob/main/contracts/SwapRouter.sol
   *
   * NOTE: None of these arguments can be trusted
   */
  function uniswapV3SwapCallback(int256, int256, bytes calldata) external {
    swapCallback();
  }

  /**
   * NOTE: None of these arguments can be trusted
   */
  function algebraSwapCallback(int256, int256, bytes calldata) external {
    swapCallback();
  }

  /**
   * NOTE: None of these arguments can be trusted
   */
  function pancakeV3SwapCallback(int256, int256, bytes calldata) external {
    swapCallback();
  }
}
