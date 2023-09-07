// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {LibWarp} from '../libraries/LibWarp.sol';
import {LibKitty} from '../libraries/LibKitty.sol';
import {Stream} from '../libraries/Stream.sol';
import {LibUniV2Like} from '../libraries/LibUniV2Like.sol';
import {IUniswapV2Pair} from '../interfaces/external/IUniswapV2Pair.sol';
import {IWarpLink} from '../interfaces/IWarpLink.sol';

contract WarpLink is IWarpLink {
  using SafeERC20 for IERC20;
  using Stream for uint256;

  struct WarpUniV2LikeWarpSingleParams {
    address tokenOut;
    address pool;
    bool zeroForOne; // tokenIn < tokenOut
    uint16 poolFeeBps;
  }

  struct WarpUniV2LikeExactInputParams {
    // NOTE: Excluding the first token
    address[] tokens;
    address[] pools;
    uint16[] poolFeesBps;
  }

  struct TransientState {
    uint256 amount;
    address payer;
    address token;
  }

  uint256 public constant COMMAND_TYPE_WRAP = 1;
  uint256 public constant COMMAND_TYPE_UNWRAP = 2;
  uint256 public constant COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE = 3;
  uint256 public constant COMMAND_TYPE_SPLIT = 4;
  uint256 public constant COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT = 5;

  function commandTypeWrap() external pure returns (uint256) {
    return COMMAND_TYPE_WRAP;
  }

  function commandTypeUnwrap() external pure returns (uint256) {
    return COMMAND_TYPE_UNWRAP;
  }

  function commandTypeWarpUniV2LikeExactInputSingle() external pure returns (uint256) {
    return COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE;
  }

  function commandTypeSplit() external pure returns (uint256) {
    return COMMAND_TYPE_SPLIT;
  }

  function commandTypeWarpUniV2LikeExactInput() external pure returns (uint256) {
    return COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT;
  }

  function processSplit(
    uint256 stream,
    TransientState memory t
  ) internal returns (TransientState memory) {
    uint256 parts = stream.readUint8();
    uint256 amountRemaining = t.amount;
    uint256 amountOutSum;

    if (parts < 2) {
      revert NotEnoughParts();
    }

    // Store the token out for the previous part to ensure every part has the same output token
    address firstPartTokenOut;
    address firstPartPayerOut;

    for (uint256 partIndex; partIndex < parts; ) {
      // TODO: Unchecked?
      // For the last part, use the remaining amount. Else read the % from the stream
      uint256 partAmount = partIndex < parts - 1
        ? (t.amount * stream.readUint16()) / 10_000
        : amountRemaining;

      if (partAmount > amountRemaining) {
        revert InsufficientAmountRemaining();
      }

      amountRemaining -= partAmount;

      TransientState memory tPart;

      tPart.amount = partAmount;
      tPart.payer = t.payer;
      tPart.token = t.token;

      tPart = engageInternal(stream, tPart);

      if (partIndex == 0) {
        firstPartPayerOut = tPart.payer;
        firstPartTokenOut = tPart.token;
      } else {
        if (tPart.token != firstPartTokenOut) {
          revert InconsistentPartTokenOut();
        }

        if (tPart.payer != firstPartPayerOut) {
          revert InconsistentPartPayerOut();
        }
      }

      // NOTE: Checked
      amountOutSum += tPart.amount;

      unchecked {
        partIndex++;
      }
    }

    t.payer = firstPartPayerOut;
    t.token = firstPartTokenOut;
    t.amount = amountOutSum;

    return t;
  }

  /**
   * Wrap ETH into WETH using the WETH contract
   *
   * The ETH must already be in this contract
   *
   * The next token will be WETH, with the amount and payer unchanged
   */
  function processWrap(TransientState memory t) internal returns (TransientState memory) {
    LibWarp.State storage s = LibWarp.state();

    if (t.token != address(0)) {
      revert UnexpectedTokenForWrap();
    }

    if (t.payer != address(this)) {
      // It's not possible to move a user's ETH
      revert UnexpectedPayerForWrap();
    }

    t.token = address(s.weth);

    s.weth.deposit{value: t.amount}();

    return t;
  }

  /**
   * Unwrap WETH into ETH using the WETH contract
   *
   * The payer can be the sender or this contract. After this operation, the
   * token will be ETH (0) and the amount will be unchanged. The next payer
   * will be this contract.
   */
  function processUnwrap(TransientState memory t) internal returns (TransientState memory) {
    LibWarp.State storage s = LibWarp.state();

    if (t.token != address(s.weth)) {
      revert UnexpectedTokenForUnwrap();
    }

    address prevPayer = t.payer;
    bool shouldMoveTokensFirst = prevPayer != address(this);

    if (shouldMoveTokensFirst) {
      t.payer = address(this);
    }

    t.token = address(0);

    if (shouldMoveTokensFirst) {
      IERC20(address(s.weth)).safeTransferFrom(prevPayer, address(this), t.amount);
    }

    s.weth.withdraw(t.amount);

    payable(t.payer).transfer(t.amount);

    return t;
  }

  /**
   * Warp a single token in a Uniswap V2-like pool
   *
   * Since the pool is not trusted, the amount out is checked before
   * and after the swap to ensure the correct amount was delivered.
   *
   * The payer can be the sender or this contract. The token must not be ETH (0).
   *
   * After this operation, the token will be `params.tokenOut` and the amount will
   * be the output of the swap. The next payer will be this contract.
   *
   * Params are read from the stream as:
   *   - tokenOut (address)
   *   - pool (address)
   *   - zeroForOne (0 or 1, uint8)
   *   - poolFeeBps (uint16)
   */
  function processWarpUniV2LikeExactInputSingle(
    uint256 stream,
    TransientState memory t
  ) internal returns (TransientState memory) {
    if (t.token == address(0)) {
      revert EthNotSupportedForWarp();
    }

    WarpUniV2LikeWarpSingleParams memory params;

    params.tokenOut = stream.readAddress();
    params.pool = stream.readAddress();
    params.zeroForOne = stream.readUint8() == 1;
    params.poolFeeBps = stream.readUint16();

    if (t.payer == address(this)) {
      // Transfer tokens to the pool
      IERC20(t.token).safeTransfer(params.pool, t.amount);
    } else {
      // Transfer tokens from the sender to the pool
      IERC20(t.token).safeTransferFrom(t.payer, params.pool, t.amount);

      // Update the payer to this contract
      t.payer = address(this);
    }

    (uint256 reserveIn, uint256 reserveOut, ) = IUniswapV2Pair(params.pool).getReserves();

    if (!params.zeroForOne) {
      // Token in > token out
      (reserveIn, reserveOut) = (reserveOut, reserveIn);
    }

    unchecked {
      // For 30 bps, multiply by 997
      uint256 feeFactor = 10_000 - params.poolFeeBps;

      t.amount =
        ((t.amount * feeFactor) * reserveOut) /
        ((reserveIn * 10_000) + (t.amount * feeFactor));
    }

    // NOTE: This check can be avoided if the factory is trusted
    uint256 balancePrev = IERC20(params.tokenOut).balanceOf(address(this));

    IUniswapV2Pair(params.pool).swap(
      params.zeroForOne ? 0 : t.amount,
      params.zeroForOne ? t.amount : 0,
      address(this),
      ''
    );

    uint256 balanceNext = IERC20(params.tokenOut).balanceOf(address(this));

    if (balanceNext < balancePrev || balanceNext < balancePrev + t.amount) {
      revert InsufficientTokensDelivered();
    }

    t.token = params.tokenOut;

    return t;
  }

  /**
   * Warp multiple tokens in a series of Uniswap V2-like pools
   *
   * Since the pools are not trusted, the balance of `params.tokenOut` is checked
   * before the first swap and after the last swap to ensure the correct amount
   * was delivered.
   *
   * The payer can be the sender or this contract. The token must not be ETH (0).
   *
   * After this operation, the token will be `params.tokenOut` and the amount will
   * be the output of the last swap. The next payer will be this contract.
   *
   * Params are read from the stream as:
   *  - pool length (uint8)
   *  - tokens (address 0, address 1, address pool length - 1) excluding the first
   *  - pools (address 0, address 1, address pool length - 1)
   *  - pool fees (uint16 0, uint16 1, uint16 pool length - 1)
   */
  function processWarpUniV2LikeExactInput(
    uint256 stream,
    TransientState memory t
  ) internal returns (TransientState memory) {
    WarpUniV2LikeExactInputParams memory params;

    uint256 poolLength = stream.readUint8();

    params.tokens = new address[](poolLength + 1);

    // The params will contain all tokens including the first to remain compatible
    // with the LibUniV2Like library's getAmountsOut function
    params.tokens[0] = t.token;

    for (uint256 index; index < poolLength; ) {
      params.tokens[index + 1] = stream.readAddress();

      unchecked {
        index++;
      }
    }

    params.pools = stream.readAddresses(poolLength);
    params.poolFeesBps = stream.readUint16s(poolLength);

    uint256 tokenOutBalancePrev = IERC20(params.tokens[poolLength]).balanceOf(address(this));

    uint256[] memory amounts = LibUniV2Like.getAmountsOut(
      params.poolFeesBps,
      t.amount,
      params.tokens,
      params.pools
    );

    if (t.payer == address(this)) {
      // Transfer tokens from this contract to the first pool
      IERC20(t.token).safeTransfer(params.pools[0], t.amount);
    } else {
      // Transfer tokens from the sender to the first pool
      IERC20(t.token).safeTransferFrom(t.payer, params.pools[0], t.amount);

      // Update the payer to this contract
      t.payer = address(this);
    }

    // Same as UniV2Like
    for (uint index; index < poolLength; ) {
      uint256 indexPlusOne = index + 1;
      bool zeroForOne = params.tokens[index] < params.tokens[indexPlusOne] ? true : false;
      address to = index < params.tokens.length - 2 ? params.pools[indexPlusOne] : address(this);

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

    uint256 nextTokenOutBalance = IERC20(params.tokens[poolLength]).balanceOf(address(this));

    t.amount = amounts[amounts.length - 1];

    if (
      // TOOD: Is this overflow check necessary?
      nextTokenOutBalance < tokenOutBalancePrev ||
      nextTokenOutBalance < tokenOutBalancePrev + t.amount
    ) {
      revert InsufficientTokensDelivered();
    }

    t.token = params.tokens[poolLength];

    return t;
  }

  function engageInternal(
    uint256 stream,
    TransientState memory t
  ) internal returns (TransientState memory) {
    uint256 commandCount = stream.readUint8();

    // TODO: End of stream check?
    for (uint256 commandIndex; commandIndex < commandCount; commandIndex++) {
      // TODO: Unchecked?
      uint256 commandType = stream.readUint8();

      if (commandType == COMMAND_TYPE_WRAP) {
        t = processWrap(t);
      } else if (commandType == COMMAND_TYPE_UNWRAP) {
        t = processUnwrap(t);
      } else if (commandType == COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE) {
        t = processWarpUniV2LikeExactInputSingle(stream, t);
      } else if (commandType == COMMAND_TYPE_SPLIT) {
        t = processSplit(stream, t);
      } else if (commandType == COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT) {
        t = processWarpUniV2LikeExactInput(stream, t);
      } else {
        revert UnhandledCommand();
      }
    }

    return t;
  }

  function warpLinkEngage(Params memory params) external payable {
    if (block.timestamp > params.deadline) {
      revert DeadlineExpired();
    }

    TransientState memory t;
    t.amount = params.amountIn;
    t.token = params.tokenIn;

    if (msg.value == 0) {
      if (params.tokenIn == address(0)) {
        revert UnexpectedValueAndTokenCombination();
      }

      // Tokens will initially moved from the sender
      t.payer = msg.sender;
    } else {
      if (params.tokenIn != address(0)) {
        revert UnexpectedValueAndTokenCombination();
      }

      if (msg.value != params.amountIn) {
        revert IncorrectEthValue();
      }

      // The ETH has already been moved to this contract
      t.payer = address(this);
    }

    uint256 stream = Stream.createStream(params.commands);

    t = engageInternal(stream, t);

    uint256 amountOut = t.amount;
    address tokenOut = t.token;

    if (tokenOut != params.tokenOut) {
      revert UnexpectedTokenOut();
    }

    // Enforce minimum amount/max slippage
    if (amountOut < LibWarp.applySlippage(params.amountOut, params.slippageBps)) {
      revert InsufficientOutputAmount();
    }

    // Collect fees
    amountOut = LibKitty.calculateAndRegisterFee(
      params.partner,
      params.tokenOut,
      params.feeBps,
      params.amountOut,
      amountOut
    );

    // Deliver tokens
    if (tokenOut == address(0)) {
      payable(params.recipient).transfer(amountOut);
    } else {
      IERC20(tokenOut).safeTransfer(params.recipient, amountOut);
    }
  }
}
