// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {PermitParams} from '../libraries/PermitParams.sol';
import {ILibCurve} from '../interfaces/ILibCurve.sol';
import {ILibStarVault} from '../interfaces/ILibStarVault.sol';
import {ILibWarp} from '../interfaces/ILibWarp.sol';

interface ICurve is ILibCurve, ILibStarVault, ILibWarp {
  error DeadlineExpired();
  error InsufficientOutputAmount();
  error EthTransferFailed();

  /**
   * A function expecting a permit was used when the input token is ETH
   */
  error PermitForEthToken();

  struct ExactInputSingleParams {
    uint256 amountIn;
    uint256 amountOut;
    address recipient;
    address pool;
    uint16 feeBps;
    uint16 slippageBps;
    address partner;
    address tokenIn;
    address tokenOut;
    uint48 deadline;
    uint8 tokenIndexIn;
    uint8 tokenIndexOut;
    uint8 kind;
    bool underlying;
  }

  function curveExactInputSinglePermit(
    ExactInputSingleParams memory params,
    PermitParams calldata permit
  ) external payable returns (uint256 amountOut);

  function curveExactInputSingle(
    ExactInputSingleParams memory params
  ) external payable returns (uint256 amountOut);
}
