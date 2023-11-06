// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Address} from '@openzeppelin/contracts/utils/Address.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IUniswapV2Pair} from '../interfaces/external/IUniswapV2Pair.sol';
import {IUniV2Like} from '../interfaces/IUniV2Like.sol';
import {LibUniV2Like} from '../libraries/LibUniV2Like.sol';
import {LibStarVault} from '../libraries/LibStarVault.sol';
import {LibWarp} from '../libraries/LibWarp.sol';
import {IUniswapV2Pair} from '../interfaces/external/IUniswapV2Pair.sol';
import {IPermit2} from '../interfaces/external/IPermit2.sol';
import {IAllowanceTransfer} from '../interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from '../libraries/PermitParams.sol';

/**
 * A router for any Uniswap V2 fork
 *
 * The pools are not trusted to deliver the correct amount of tokens, so the router
 * verifies this.
 *
 * The pool addresses passed in as a parameter instead of being looked up from the factory. The caller
 * may use `getPair` on the factory to calculate pool addresses.
 *
 * Fees may vary from Uniswap V2's 0.3% (30 bps) and are passed in as `poolFeeBps`.
 *
 * Inspired by https://github.com/sushiswap/sushiswap/blob/master/protocols/route-processor/contracts/RouteProcessor4.sol#L323
 */
contract UniV2LikeFacet is IUniV2Like {
  using SafeERC20 for IERC20;
  using Address for address;

  /**
   * NOTE: The tokens must already have been moved to the first pool
   */
  function uniswapV2LikeExactInputSingleInternal(
    ExactInputSingleParams memory params
  ) internal returns (uint256 amountOut) {
    LibWarp.State storage s = LibWarp.state();

    bool isFromEth = params.tokenIn == address(0);
    bool isToEth = params.tokenOut == address(0);

    uint256 tokenOutBalancePrev = isToEth
      ? address(this).balance
      : IERC20(params.tokenOut).balanceOf(address(this));

    if (isFromEth) {
      params.tokenIn = address(s.weth);
    }

    if (isToEth) {
      params.tokenOut = address(s.weth);
    }

    (uint256 reserveIn, uint256 reserveOut, ) = IUniswapV2Pair(params.pool).getReserves();

    if (params.tokenIn > params.tokenOut) {
      (reserveIn, reserveOut) = (reserveOut, reserveIn);
    }

    unchecked {
      // For 25 bps, multiply by 9975
      uint256 feeFactor = 10_000 - params.poolFeeBps;

      amountOut =
        ((params.amountIn * feeFactor) * reserveOut) /
        ((reserveIn * 10_000) + (params.amountIn * feeFactor));
    }

    // Enforce minimum amount/max slippage
    if (amountOut < LibWarp.applySlippage(params.amountOut, params.slippageBps)) {
      revert InsufficientOutputAmount();
    }

    bool zeroForOne = params.tokenIn < params.tokenOut ? true : false;

    IUniswapV2Pair(params.pool).swap(
      zeroForOne ? 0 : amountOut,
      zeroForOne ? amountOut : 0,
      address(this),
      ''
    );

    uint256 nextTokenOutBalance = IERC20(params.tokenOut).balanceOf(address(this));

    if (
      nextTokenOutBalance < tokenOutBalancePrev ||
      nextTokenOutBalance < tokenOutBalancePrev + amountOut
    ) {
      revert InsufficienTokensDelivered();
    }

    // NOTE: Fee is collected as WETH instead of ETH
    amountOut = LibStarVault.calculateAndRegisterFee(
      params.partner,
      params.tokenOut,
      params.feeBps,
      params.amountOut,
      amountOut
    );

    if (isToEth) {
      // Unwrap WETH
      s.weth.withdraw(amountOut);

      (bool sent, ) = params.recipient.call{value: amountOut}('');

      if (!sent) {
        revert EthTransferFailed();
      }
    } else {
      IERC20(params.tokenOut).safeTransfer(params.recipient, amountOut);
    }

    emit LibWarp.Warp(
      params.partner,
      // NOTE: The tokens may have been rewritten to WETH
      isFromEth ? address(0) : params.tokenIn,
      isToEth ? address(0) : params.tokenOut,
      params.amountIn,
      amountOut
    );
  }

  function uniswapV2LikeExactInputSingle(
    ExactInputSingleParams calldata params
  ) external payable returns (uint256 amountOut) {
    if (block.timestamp > params.deadline) {
      revert DeadlineExpired();
    }

    if (params.tokenIn == address(0)) {
      // From ETH
      if (msg.value != params.amountIn) {
        revert IncorrectEthValue();
      }

      LibWarp.state().weth.deposit{value: msg.value}();

      // Transfer tokens to the pool
      IERC20(address(LibWarp.state().weth)).safeTransfer(params.pool, params.amountIn);
    } else {
      IERC20(params.tokenIn).safeTransferFrom(msg.sender, params.pool, params.amountIn);
    }

    return uniswapV2LikeExactInputSingleInternal(params);
  }

  function uniswapV2LikeExactInputSinglePermit(
    ExactInputSingleParams calldata params,
    PermitParams calldata permit
  ) external returns (uint256 amountOut) {
    // Permit tokens / set allowance
    LibWarp.state().permit2.permit(
      msg.sender,
      IAllowanceTransfer.PermitSingle({
        details: IAllowanceTransfer.PermitDetails({
          token: params.tokenIn,
          amount: (uint160)(params.amountIn),
          expiration: (uint48)(params.deadline),
          nonce: (uint48)(permit.nonce)
        }),
        spender: address(this),
        sigDeadline: (uint256)(params.deadline)
      }),
      permit.signature
    );

    // Transfer tokens from msg.sender to the pool
    LibWarp.state().permit2.transferFrom(
      msg.sender,
      params.pool,
      (uint160)(params.amountIn),
      params.tokenIn
    );

    return uniswapV2LikeExactInputSingleInternal(params);
  }

  function uniswapV2LikeExactInputInternal(
    ExactInputParams calldata params
  ) internal returns (uint256 amountOut) {
    LibWarp.State storage s = LibWarp.state();

    address[] memory tokens = params.tokens;
    uint256 poolLength = params.pools.length;
    bool isFromEth = tokens[0] == address(0);
    bool isToEth = tokens[poolLength] == address(0);

    if (isFromEth) {
      tokens[0] = address(s.weth);
    }

    uint256 tokenOutBalancePrev = isToEth
      ? address(this).balance
      : IERC20(tokens[poolLength]).balanceOf(address(this));

    uint256[] memory amounts = LibUniV2Like.getAmountsOut(
      params.poolFeesBps,
      params.amountIn,
      tokens,
      params.pools
    );

    // Enforce minimum amount/max slippage
    if (amounts[amounts.length - 1] < LibWarp.applySlippage(params.amountOut, params.slippageBps)) {
      revert InsufficientOutputAmount();
    }

    // From https://github.com/Uniswap/v2-periphery/blob/master/contracts/UniswapV2Router02.sol
    for (uint index; index < poolLength; ) {
      uint256 indexPlusOne = index + 1;
      bool zeroForOne = tokens[index] < tokens[indexPlusOne] ? true : false;
      address to = index < tokens.length - 2 ? params.pools[indexPlusOne] : address(this);

      IUniswapV2Pair(params.pools[index]).swap(
        zeroForOne ? 0 : amounts[indexPlusOne],
        zeroForOne ? amounts[indexPlusOne] : 0,
        to,
        ''
      );

      unchecked {
        index++;
      }
    }

    uint256 nextTokenOutBalance = IERC20(tokens[poolLength]).balanceOf(address(this));

    if (
      // TOOD: Is this overflow check necessary?
      nextTokenOutBalance < tokenOutBalancePrev ||
      nextTokenOutBalance < tokenOutBalancePrev + amountOut
    ) {
      revert InsufficienTokensDelivered();
    }

    // NOTE: Fee is collected as WETH instead of ETH
    amountOut = LibStarVault.calculateAndRegisterFee(
      params.partner,
      tokens[poolLength],
      params.feeBps,
      params.amountOut,
      amounts[poolLength]
    );

    if (isToEth) {
      // Unwrap WETH
      s.weth.withdraw(amountOut);

      (bool sent, ) = params.recipient.call{value: amountOut}('');

      if (!sent) {
        revert EthTransferFailed();
      }
    } else {
      IERC20(tokens[poolLength]).safeTransfer(params.recipient, amountOut);
    }

    emit LibWarp.Warp(
      params.partner,
      // NOTE: The tokens may have been rewritten to WETH
      isFromEth ? address(0) : tokens[0],
      isToEth ? address(0) : tokens[poolLength],
      params.amountIn,
      amountOut
    );
  }

  function uniswapV2LikeExactInput(
    ExactInputParams calldata params
  ) external payable returns (uint256 amountOut) {
    if (block.timestamp > params.deadline) {
      revert DeadlineExpired();
    }

    if (params.tokens[0] == address(0)) {
      // From ETH
      if (msg.value != params.amountIn) {
        revert IncorrectEthValue();
      }

      LibWarp.state().weth.deposit{value: msg.value}();

      // Transfer tokens to the first pool
      IERC20(address(LibWarp.state().weth)).safeTransfer(params.pools[0], params.amountIn);
    } else {
      IERC20(params.tokens[0]).safeTransferFrom(msg.sender, params.pools[0], params.amountIn);
    }

    return uniswapV2LikeExactInputInternal(params);
  }

  function uniswapV2LikeExactInputPermit(
    ExactInputParams calldata params,
    PermitParams calldata permit
  ) external returns (uint256 amountOut) {
    // Permit tokens / set allowance
    LibWarp.state().permit2.permit(
      msg.sender,
      IAllowanceTransfer.PermitSingle({
        details: IAllowanceTransfer.PermitDetails({
          token: params.tokens[0],
          amount: (uint160)(params.amountIn),
          expiration: (uint48)(params.deadline),
          nonce: (uint48)(permit.nonce)
        }),
        spender: address(this),
        sigDeadline: (uint256)(params.deadline)
      }),
      permit.signature
    );

    // Transfer tokens from msg.sender to the first pool
    LibWarp.state().permit2.transferFrom(
      msg.sender,
      params.pools[0],
      (uint160)(params.amountIn),
      params.tokens[0]
    );

    return uniswapV2LikeExactInputInternal(params);
  }
}
