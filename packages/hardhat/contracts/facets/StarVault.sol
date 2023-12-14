// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {LibDiamond} from '../libraries/LibDiamond.sol';
import {LibStarVault} from '../libraries/LibStarVault.sol';
import {IStarVault} from '../interfaces/IStarVault.sol';

/**
 * The StarVault estimates, collects, and tracks fees for partners
 */
contract StarVault is IStarVault {
  using SafeERC20 for IERC20;

  error InsufficientOwnerBalance(uint256 available);

  function partnerTokenBalance(address partner, address token) external view returns (uint256) {
    LibStarVault.State storage s = LibStarVault.state();

    return s.partnerBalances[partner][token];
  }

  function partnerWithdraw(address token) external {
    LibStarVault.State storage s = LibStarVault.state();

    uint256 balance = s.partnerBalances[msg.sender][token];

    if (balance > 0) {
      s.partnerBalances[msg.sender][token] = 0;
      s.partnerBalancesTotal[token] -= balance;

      emit Withdraw(msg.sender, token, balance);

      if (token == address(0)) {
        // NOTE: Control transfered to untrusted address
        (bool sent, ) = payable(msg.sender).call{value: balance}('');

        if (!sent) {
          revert EthTransferFailed();
        }
      } else {
        // NOTE: The token is not removed from the partner's token set
        IERC20(token).safeTransfer(msg.sender, balance);
      }
    }
  }

  function ownerWithdraw(address token, uint256 amount, address payable to) external {
    LibDiamond.enforceIsContractOwner();

    LibStarVault.State storage s = LibStarVault.state();

    uint256 partnerBalanceTotal = s.partnerBalancesTotal[token];

    uint256 balance = token == address(0)
      ? address(this).balance
      : IERC20(token).balanceOf(address(this));

    uint256 available = balance - partnerBalanceTotal;

    if (amount > available) {
      revert InsufficientOwnerBalance(available);
    }

    emit Withdraw(address(0), token, amount);

    if (token == address(0)) {
      // Send ETH
      (bool sent, ) = to.call{value: amount}('');

      if (!sent) {
        revert EthTransferFailed();
      }
    } else {
      IERC20(token).safeTransfer(to, amount);
    }
  }
}
