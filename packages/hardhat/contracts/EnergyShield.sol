// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IEnergyShield} from './interfaces/IEnergyShield.sol';

/**
 * The EnergyShield contract is used to perform arbitrary, possible unsafe calls
 * by the Sifi Diamond.
 *
 * Because it holds no balance, this contract can't be tricked into giving it away
 * by an attacker.
 *
 * The functions `single` and `multi` are callable by anyone. Note a caller can
 * instruct this contract to set the allowance of any token and this allowance will
 * carry over to the next caller.
 *
 * This contract is stateless, meaning it should never hold any balances.
 * While there is a `drain` method, any user can effectively drain this contract
 * by using `single` or `multi` to send tokens to themselves.
 */
contract EnergyShield is Ownable, IEnergyShield {
  using SafeERC20 for IERC20;

  function single(SingleParams calldata params) external payable returns (uint256 amountOut) {
    uint256 senderPrevBalance;

    if (params.delivers) {
      senderPrevBalance = params.tokenOut == address(0)
        ? msg.sender.balance
        : IERC20(params.tokenOut).balanceOf(msg.sender);
    }

    // NOTE: `msg.value` may be zero for calls such as `approve` or `transferFrom`,
    // and greater than zero for calls such as wrapping ETH
    (bool success, ) = params.target.call{value: msg.value}(params.data);

    if (!success) {
      revert CallFailed();
    }

    if (params.delivers) {
      unchecked {
        amountOut = params.tokenOut == address(0)
          ? msg.sender.balance - senderPrevBalance
          : IERC20(params.tokenOut).balanceOf(msg.sender) - senderPrevBalance;
      }
    } else {
      if (params.tokenOut == address(0)) {
        amountOut = address(this).balance;

        (bool sent, ) = msg.sender.call{value: amountOut}('');

        if (!sent) {
          revert EthTransferFailed();
        }
      } else {
        amountOut = IERC20(params.tokenOut).balanceOf(address(this));

        IERC20(params.tokenOut).safeTransfer(msg.sender, amountOut);
      }
    }
  }

  /**
   * Inspired by https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol
   */
  function externalCall(
    address target,
    uint256 value,
    bytes memory data,
    uint256 offset,
    uint256 length
  ) internal {
    bool result;

    assembly {
      result := call(
        sub(gas(), 34710), // 34710 is the value that solidity is currently emitting
        // It includes callGas (700) + callVeryLow (3, to pay for SUB) + callValueTransferGas (9000) +
        // callNewAccountGas (25000, in case the destination address does not exist and needs creating)
        target,
        value,
        add(add(data, 32), offset), // The data itself starts after the first 32 bytes
        length, // Size of the input (in bytes) - this is what fixes the padding problem
        mload(0x40),
        0 // Output is ignored, therefore the output size is zero
      )
    }

    if (!result) {
      revert CallFailed();
    }
  }

  function multi(MultiParams calldata params) external payable returns (uint256 amountOut) {
    uint256 senderPrevBalance;

    if (params.delivers) {
      senderPrevBalance = params.tokenOut == address(0)
        ? msg.sender.balance
        : IERC20(params.tokenOut).balanceOf(msg.sender);
    }

    for (uint256 i = 0; i < params.targets.length; ) {
      unchecked {
        uint256 offset = i == 0 ? 0 : params.offsets[i - 1];

        externalCall(
          params.targets[i],
          i == 0 ? msg.value : 0,
          params.data,
          offset,
          i == params.targets.length - 1 ? params.data.length - offset : params.offsets[i] - offset
        );

        ++i;
      }
    }

    if (params.delivers) {
      unchecked {
        amountOut = params.tokenOut == address(0)
          ? msg.sender.balance - senderPrevBalance
          : IERC20(params.tokenOut).balanceOf(msg.sender) - senderPrevBalance;
      }
    } else {
      if (params.tokenOut == address(0)) {
        amountOut = address(this).balance;

        (bool sent, ) = msg.sender.call{value: amountOut}('');

        if (!sent) {
          revert EthTransferFailed();
        }
      } else {
        amountOut = IERC20(params.tokenOut).balanceOf(address(this));

        IERC20(params.tokenOut).safeTransfer(msg.sender, amountOut);
      }
    }
  }

  /**
   * Allow the owner (Sifi Diamond) to drain any tokens that are sent here by mistake
   */
  function drain(address token) external onlyOwner {
    if (token == address(0)) {
      (bool sent, ) = msg.sender.call{value: address(this).balance}('');

      if (!sent) {
        revert EthTransferFailed();
      }
    } else {
      IERC20(token).safeTransfer(msg.sender, IERC20(token).balanceOf(address(this)));
    }
  }
}
