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

contract SifiV1Router02 is Ownable {
  using SafeERC20 for IERC20;
  using Address for address;

  /**
   *
   * @param partner Tokens out for partner
   * @param service Tokens out for service
   */
  event FeeTaken(uint256 partner, uint256 service);

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

  function takeFeeTokens(
    address partner,
    uint16 feeBps,
    address token,
    uint256 amountOutMin,
    uint256 amountOut
  ) private returns (uint256 amountOutUser) {
    // Positive slippage +
    uint256 feeTotal = (amountOut > amountOutMin ? amountOut - amountOutMin : 0) +
      // Fee
      ((amountOutMin * (10000 - feeBps)) / 10000);

    // If a partner is set, split the fee in half
    uint256 feePartner = partner == address(0) ? 0 : (feeTotal * 50) / 100;

    uint256 feeSite = feeTotal - feePartner;

    if (feePartner > 0) {
      // Transfer fee to partner
      IERC20(token).safeTransfer(partner, feePartner);
    }

    if (feeSite > 0) {
      IERC20(token).safeTransfer(fees, feeSite);

      emit FeeTaken(feePartner, feeSite);
    }

    amountOutUser = amountOut - feeTotal;
  }

  function takeFeeETH(
    address partner,
    uint16 feeBps,
    uint256 amountOutMin,
    uint256 amountOut
  ) private returns (uint256 amountOutUser) {
    // Positive slippage +
    uint256 feeTotal = (amountOut > amountOutMin ? amountOut - amountOutMin : 0) +
      // Fee
      ((amountOutMin * (10000 - feeBps)) / 10000);

    // If a partner is set, split the fee in half
    uint256 feePartner = partner == address(0) ? 0 : (feeTotal * 50) / 100;

    uint256 feeSite = feeTotal - feePartner;

    if (feePartner > 0) {
      // Transfer fee to partner
      (bool sentPartner, ) = partner.call{value: feePartner}('');

      if (!sentPartner) {
        revert EthTransferFailed();
      }
    }

    if (feeSite > 0) {
      (bool sentSite, ) = fees.call{value: feeSite}('');

      if (!sentSite) {
        revert EthTransferFailed();
      }

      emit FeeTaken(feePartner, feeSite);
    }

    amountOutUser = amountOut - feeTotal;
  }

  /**
   * @param amountOutMin Quoted amount out
   * @param path [input coin, ..., output coin]
   * @param to Recipient of output coin
   * @param slippage Slippage tolerance in bps
   * @param deadline Deadline in unix timestamp
   */
  function uniswapV2SwapExactETHForTokens(
    uint256 amountOutMin,
    address[] memory path,
    address to,
    uint16 slippage,
    uint48 deadline,
    address partner,
    uint16 feeBps
  ) public payable returns (uint256[] memory amounts) {
    path[0] = address(weth);

    uint256 pathLengthMinusOne = path.length - 1;
    address tokenOut = path[pathLengthMinusOne];

    unchecked {
      amounts = uniswapV2router02.swapExactETHForTokens{value: msg.value}(
        (amountOutMin * (10000 - slippage)) / 10000,
        path,
        address(this),
        deadline
      );

      amounts[pathLengthMinusOne] = takeFeeTokens(
        partner,
        feeBps,
        tokenOut,
        amountOutMin,
        amounts[pathLengthMinusOne]
      );
    }

    // Transfer tokens to user
    IERC20(path[1]).safeTransfer(to, amounts[pathLengthMinusOne]);

    return amounts;
  }

  function uniswapV2SwapExactTokensForETH(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] memory path,
    address payable to,
    uint16 slippage,
    uint48 deadline,
    address partner,
    uint16 feeBps
  ) public returns (uint256[] memory amounts) {
    spender.transferFrom({token: path[0], from: msg.sender, to: address(this), amount: amountIn});

    IERC20(path[0]).safeApprove(address(uniswapV2router02), amountIn);

    uint256 pathLengthMinusOne = path.length - 1;
    path[pathLengthMinusOne] = address(weth);

    unchecked {
      amounts = uniswapV2router02.swapExactTokensForETH(
        amountIn,
        (amountOutMin * (10000 - slippage)) / 10000,
        path,
        address(this),
        deadline
      );

      amounts[pathLengthMinusOne] = takeFeeETH(
        partner,
        feeBps,
        amountOutMin,
        amounts[pathLengthMinusOne]
      );
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
    uint256 amountOutMin,
    address[] memory path,
    address to,
    uint16 slippage,
    uint48 deadline,
    address partner,
    uint16 feeBps
  ) public returns (uint256[] memory amounts) {
    spender.transferFrom({token: path[0], from: msg.sender, to: address(this), amount: amountIn});

    IERC20(path[0]).safeApprove(address(uniswapV2router02), amountIn);

    uint256 pathLengthMinusOne = path.length - 1;
    address tokenOut = path[pathLengthMinusOne];

    unchecked {
      amounts = uniswapV2router02.swapExactTokensForTokens(
        amountIn,
        (amountOutMin * (10000 - slippage)) / 10000,
        path,
        address(this),
        deadline
      );

      amounts[pathLengthMinusOne] = takeFeeTokens(
        partner,
        feeBps,
        tokenOut,
        amountOutMin,
        amounts[pathLengthMinusOne]
      );
    }

    // Transfer tokens to user
    IERC20(path[1]).safeTransfer(to, amounts[pathLengthMinusOne]);

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
