// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Address} from '@openzeppelin/contracts/utils/Address.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IUniswapV2Pair} from 'contracts/v2/interfaces/external/IUniswapV2Pair.sol';
import {IUniV2Router} from 'contracts/v2/interfaces/IUniV2Router.sol';
import {LibUniV2Router} from 'contracts/v2/libraries/LibUniV2Router.sol';
import {LibKitty} from 'contracts/v2/libraries/LibKitty.sol';
import {Errors} from 'contracts/v2/libraries/Errors.sol';

contract UniV2RouterFacet is IUniV2Router {
  using SafeERC20 for IERC20;
  using Address for address;

  // TODO: Change to external once the legacy functions are removed
  function uniswapV2ExactInput(
    ExactInputParams memory params
  ) public payable returns (uint256 amountOut) {
    if (block.timestamp > params.deadline) {
      revert Errors.DeadlineExpired();
    }

    LibUniV2Router.DiamondStorage storage s = LibUniV2Router.diamondStorage();

    uint256 pathLengthMinusOne = params.path.length - 1;
    bool isFromEth = params.path[0] == address(0);
    bool isToEth = params.path[pathLengthMinusOne] == address(0);

    if (isFromEth) {
      params.path[0] = address(s.weth);
    }

    if (isToEth) {
      params.path[pathLengthMinusOne] = address(s.weth);
    }

    (address[] memory pairs, uint256[] memory amounts) = LibUniV2Router.getPairsAndAmountsFromPath(
      s.uniswapV2Factory,
      params.amountIn,
      params.path
    );

    // Enforce minimum amount/max slippage
    if (
      amounts[amounts.length - 1] < LibUniV2Router.applySlippage(params.amountOut, params.slippage)
    ) {
      revert Errors.InsufficientOutputAmount();
    }

    if (isFromEth) {
      // From ETH
      if (msg.value != params.amountIn) {
        revert Errors.IncorrectEthValue();
      }

      s.weth.deposit{value: msg.value}();

      // Transfer tokens to the first pool
      IERC20(params.path[0]).safeTransfer(pairs[0], params.amountIn);
    } else {
      // Transfer tokens from the sender to the first pool
      IERC20(params.path[0]).safeTransferFrom(msg.sender, pairs[0], params.amountIn);
    }

    // From https://github.com/Uniswap/v2-periphery/blob/master/contracts/UniswapV2Router02.sol
    for (uint index; index < pathLengthMinusOne; ) {
      uint256 indexPlusOne = index + 1;
      bool zeroForOne = params.path[index] < params.path[indexPlusOne] ? true : false;
      address to = index < params.path.length - 2 ? pairs[indexPlusOne] : address(this);

      IUniswapV2Pair(pairs[index]).swap(
        zeroForOne ? 0 : amounts[indexPlusOne],
        zeroForOne ? amounts[indexPlusOne] : 0,
        to,
        ''
      );

      unchecked {
        index++;
      }
    }

    // NOTE: Fee is collected as WETH instead of ETH
    amountOut = LibKitty.calculateAndRegisterFee(
      params.partner,
      params.path[pathLengthMinusOne],
      params.feeBps,
      params.amountOut,
      amounts[pathLengthMinusOne]
    );

    if (amountOut == 0) {
      revert Errors.ZeroAmountOut();
    }

    if (isToEth) {
      // Unwrap WETH
      s.weth.withdraw(amountOut);

      (bool sent, ) = params.recipient.call{value: amountOut}('');

      if (!sent) {
        revert Errors.EthTransferFailed();
      }
    } else {
      IERC20(params.path[pathLengthMinusOne]).safeTransfer(params.recipient, amountOut);
    }
  }

  /**
   * @param amountOut Amount out before slippage
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
    uint256 deadline,
    address partner,
    uint16 feeBps
  ) external payable returns (uint256[] memory amounts) {
    amounts = new uint256[](path.length);
    amounts[0] = msg.value;

    // NOTE: May have been passed in as 0xeee
    path[0] = address(0);

    amounts[path.length - 1] = uniswapV2ExactInput(
      ExactInputParams({
        amountIn: msg.value,
        amountOut: amountOut,
        recipient: to,
        slippage: (uint16)(slippage),
        feeBps: feeBps,
        deadline: (uint48)(deadline),
        partner: partner,
        path: path
      })
    );
  }

  function uniswapV2SwapExactTokensForETH(
    uint256 amountIn,
    uint256 amountOut,
    address[] memory path,
    address payable to,
    uint256 slippage,
    uint256 deadline,
    address partner,
    uint16 feeBps
  ) external returns (uint256[] memory amounts) {
    amounts = new uint256[](path.length);
    amounts[0] = amountIn;

    // NOTE: May have been passed in as 0xeee
    path[path.length - 1] = address(0);

    amounts[path.length - 1] = uniswapV2ExactInput(
      ExactInputParams({
        amountIn: amountIn,
        amountOut: amountOut,
        recipient: to,
        slippage: (uint16)(slippage),
        feeBps: feeBps,
        deadline: (uint48)(deadline),
        partner: partner,
        path: path
      })
    );
  }

  function uniswapV2SwapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOut,
    address[] memory path,
    address to,
    uint256 slippage,
    uint256 deadline,
    address partner,
    uint16 feeBps
  ) external returns (uint256[] memory amounts) {
    amounts = new uint256[](path.length);

    amounts[0] = amountIn;

    amounts[path.length - 1] = uniswapV2ExactInput(
      ExactInputParams({
        amountIn: amountIn,
        amountOut: amountOut,
        recipient: to,
        slippage: (uint16)(slippage),
        feeBps: feeBps,
        deadline: (uint48)(deadline),
        partner: partner,
        path: path
      })
    );
  }
}
