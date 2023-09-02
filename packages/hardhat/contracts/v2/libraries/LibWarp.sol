// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

library LibWarp {
  function applySlippage(uint256 amount, uint16 slippage) internal pure returns (uint256) {
    return (amount * (10_000 - slippage)) / 10_000;
  }
}
