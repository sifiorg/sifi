// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {LibDiamond} from '../libraries/LibDiamond.sol';
import {LibStarVault} from '../libraries/LibStarVault.sol';

interface IStarVault {
  error EthTransferFailed();

  event Withdraw(address indexed partner, address indexed token, uint256 amount);

  function partnerTokenBalance(address partner, address token) external view returns (uint256);

  function partnerWithdraw(address token) external;

  function ownerWithdraw(address token, uint256 amount, address payable to) external;
}
