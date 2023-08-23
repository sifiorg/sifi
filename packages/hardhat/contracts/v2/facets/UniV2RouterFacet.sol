// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Address} from '@openzeppelin/contracts/utils/Address.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {IWETH} from '@uniswap/v2-periphery/contracts/interfaces/IWETH.sol';
import {LibDiamond} from '../libraries/LibDiamond.sol';
import {IUniV2RouterFacet} from 'contracts/v2/interfaces/IUniV2RouterFacet.sol';
import {Errors} from 'contracts/v2/libraries/Errors.sol';
import {LibUniV2Router} from 'contracts/v2/libraries/LibUniV2Router.sol';

contract UniV2RouterFacet is IUniV2RouterFacet, Errors {
  using SafeERC20 for IERC20;
  using Address for address;

  function initUniV2Router(address _uniswapV2Router02) public {
    LibDiamond.enforceIsContractOwner();

    LibUniV2Router.DiamondStorage storage s = LibUniV2Router.diamondStorage();

    if (!s.isInitialized) {
      s.isInitialized = true;
      s.uniswapV2router02 = IUniswapV2Router02(_uniswapV2Router02);
      s.weth = IWETH(s.uniswapV2router02.WETH());
    }
  }

  /**
   * @param amountOut Quoted amount out
   * @param path [input coin, ..., output coin]
   * @param to Recipient of output coin
   * @param slippage Slippage tolerance in bps
   * @param deadline Deadline in unix timestamp
   */
  function uniswapV2SwapExactETHForTokens(
    uint256 amountOut,
    address[] memory path,
    address to,
    uint256 slippage,
    uint256 deadline
  ) external payable returns (uint256[] memory amounts) {
    LibUniV2Router.DiamondStorage storage s = LibUniV2Router.diamondStorage();

    path[0] = address(s.weth);

    unchecked {
      amounts = s.uniswapV2router02.swapExactETHForTokens{value: msg.value}(
        (amountOut * (10000 - slippage)) / 10000,
        path,
        address(this),
        deadline
      );
    }

    uint256 pathLengthMinusOne = path.length - 1;

    if (amounts[pathLengthMinusOne] > amountOut) {
      // Keep positive
      amounts[pathLengthMinusOne] = amountOut;
    }

    // Transfer tokens to user
    IERC20(path[pathLengthMinusOne]).safeTransfer(to, amounts[pathLengthMinusOne]);

    return amounts;
  }

  function uniswapV2SwapExactTokensForETH(
    uint256 amountIn,
    uint256 amountOut,
    address[] memory path,
    address payable to,
    uint256 slippage,
    uint256 deadline
  ) external returns (uint256[] memory amounts) {
    LibUniV2Router.DiamondStorage storage s = LibUniV2Router.diamondStorage();

    IERC20(path[0]).safeTransferFrom(msg.sender, address(this), amountIn);

    IERC20(path[0]).safeApprove(address(s.uniswapV2router02), amountIn);

    uint256 pathLengthMinusOne = path.length - 1;

    path[pathLengthMinusOne] = address(s.weth);

    unchecked {
      amounts = s.uniswapV2router02.swapExactTokensForETH(
        amountIn,
        (amountOut * (10000 - slippage)) / 10000,
        path,
        address(this),
        deadline
      );
    }

    if (amounts[pathLengthMinusOne] > amountOut) {
      // Keep positive
      amounts[pathLengthMinusOne] = amountOut;
    }

    // Transfer ETH to user
    (bool sent, ) = to.call{value: amounts[pathLengthMinusOne]}('');

    if (!sent) {
      revert EthTransferFailed();
    }

    return amounts;
  }

  function uniswapV2SwapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOut,
    address[] memory path,
    address to,
    uint256 slippage,
    uint256 deadline
  ) external returns (uint256[] memory amounts) {
    LibUniV2Router.DiamondStorage storage s = LibUniV2Router.diamondStorage();

    IERC20(path[0]).safeTransferFrom(msg.sender, address(this), amountIn);

    IERC20(path[0]).safeApprove(address(s.uniswapV2router02), amountIn);

    unchecked {
      amounts = s.uniswapV2router02.swapExactTokensForTokens(
        amountIn,
        (amountOut * (10000 - slippage)) / 10000,
        path,
        address(this),
        deadline
      );
    }

    uint256 pathLengthMinusOne = path.length - 1;

    if (amounts[pathLengthMinusOne] > amountOut) {
      // Keep positive
      amounts[pathLengthMinusOne] = amountOut;
    }

    // Transfer tokens to user
    IERC20(path[pathLengthMinusOne]).safeTransfer(to, amounts[pathLengthMinusOne]);

    return amounts;
  }
}
