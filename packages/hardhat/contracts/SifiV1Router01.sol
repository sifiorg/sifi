// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import 'hardhat/console.sol';
import {Address} from '@openzeppelin/contracts/utils/Address.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {IWETH} from '@uniswap/v2-periphery/contracts/interfaces/IWETH.sol';
import {ISpender} from './ISpender.sol';

contract SifiV1Router01 is Ownable {
  using SafeERC20 for IERC20;
  using Address for address;

  error EthTransferFailed();

  ISpender private immutable spender;
  IUniswapV2Router02 private immutable uniswapV2router02;
  IWETH private immutable weth;
  address private immutable fees;

  constructor(address _spender, address payable _fees, address _weth, address _uniswapV2router02) {
    spender = ISpender(_spender);
    fees = _fees;
    weth = IWETH(_weth);
    uniswapV2router02 = IUniswapV2Router02(_uniswapV2router02);
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
    uint16 slippage,
    uint48 deadline
  ) public payable returns (uint256[] memory amounts) {
    path[0] = address(weth);

    unchecked {
      amounts = uniswapV2router02.swapExactETHForTokens{value: msg.value}(
        (amountOut * (10000 - slippage)) / 10000,
        path,
        address(this),
        deadline
      );
    }

    if (amounts[1] > amountOut) {
      // Transfer positive slippage to fee address
      IERC20(path[1]).safeTransfer(fees, amounts[1] - amountOut);

      amounts[1] = amountOut;
    }

    // Transfer tokens to user
    IERC20(path[1]).safeTransfer(to, amounts[1]);

    return amounts;
  }

  function uniswapV2SwapExactTokensForETH(
    uint256 amountIn,
    uint256 amountOut,
    address[] memory path,
    address payable to,
    uint16 slippage,
    uint48 deadline
  ) public returns (uint256[] memory amounts) {
    spender.transferFrom({token: path[0], from: msg.sender, to: address(this), amount: amountIn});

    IERC20(path[0]).safeApprove(address(uniswapV2router02), amountIn);

    path[1] = address(weth);

    unchecked {
      amounts = uniswapV2router02.swapExactTokensForETH(
        amountIn,
        (amountOut * (10000 - slippage)) / 10000,
        path,
        address(this),
        deadline
      );
    }

    if (amounts[1] > amountOut) {
      // Transfer positive slippage to fee address
      (bool sentPositiveSlippage, ) = (fees).call{value: amounts[1] - amountOut}('');

      if (!sentPositiveSlippage) {
        revert EthTransferFailed();
      }

      amounts[1] = amountOut;
    }

    // Transfer ETH to user
    (bool sent, ) = to.call{value: amounts[1]}('');

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
    uint16 slippage,
    uint48 deadline
  ) public returns (uint256[] memory amounts) {
    spender.transferFrom({token: path[0], from: msg.sender, to: address(this), amount: amountIn});

    IERC20(path[0]).safeApprove(address(uniswapV2router02), amountIn);

    unchecked {
      amounts = uniswapV2router02.swapExactTokensForTokens(
        amountIn,
        (amountOut * (10000 - slippage)) / 10000,
        path,
        address(this),
        deadline
      );
    }

    if (amounts[1] > amountOut) {
      // Transfer positive slippage to fee address
      IERC20(path[1]).safeTransfer(fees, amounts[1] - amountOut);

      amounts[1] = amountOut;
    }

    // Transfer tokens to user
    IERC20(path[1]).safeTransfer(to, amounts[1]);

    return amounts;
  }

  // Admin withdraw in case of misplaced funds
  function withdraw(address token, address recipient) external onlyOwner {
    if (token == address(0)) {
      // Send ETH
      (bool sent, ) = payable(recipient).call{value: address(this).balance}('');

      if (!sent) {
        revert EthTransferFailed();
      }

      return;
    }

    IERC20(token).safeTransfer(recipient, IERC20(token).balanceOf(address(this)));
  }

  // This contract will receive ETH from other contracts as swap settlements
  receive() external payable {}
}
