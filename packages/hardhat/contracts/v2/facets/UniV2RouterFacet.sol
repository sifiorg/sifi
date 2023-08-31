// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Address} from '@openzeppelin/contracts/utils/Address.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
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
    LibUniV2Router.DiamondStorage storage s = LibUniV2Router.diamondStorage();

    if (params.path[0] == address(0)) {
      if (msg.value != params.amountIn) {
        revert Errors.IncorrectEthValue();
      }

      s.weth.deposit{value: msg.value}();

      params.path[0] = address(s.weth);
    } else {
      IERC20(params.path[0]).safeTransferFrom(msg.sender, address(this), params.amountIn);
    }

    bool isToEth = params.path[params.path.length - 1] == address(0);

    if (isToEth) {
      params.path[params.path.length - 1] = address(s.weth);
    }

    IERC20(params.path[0]).safeApprove(address(s.uniswapV2router02), params.amountIn);

    uint256 amountOutMin = LibUniV2Router.applySlippage(params.amountOut, params.slippage);

    unchecked {
      uint256[] memory amounts = s.uniswapV2router02.swapExactTokensForTokens(
        params.amountIn,
        amountOutMin,
        params.path,
        address(this),
        params.deadline
      );

      amountOut = amounts[params.path.length - 1];
    }

    // NOTE: Fee is collected as WETH instead of ETH
    amountOut = LibKitty.calculateAndRegisterFee(
      params.partner,
      params.path[params.path.length - 1],
      params.feeBps,
      params.amountOut,
      amountOut
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
      IERC20(params.path[params.path.length - 1]).safeTransfer(params.recipient, amountOut);
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
