// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Mainnet} from './Networks.sol';
import {ICurvePoolKind1, ICurvePoolKind2, ICurvePoolKind3, ICurvePoolKind4} from 'contracts/interfaces/external/ICurvePool.sol';

contract CurveHelpers {
  function getIndex(uint8 kind, address pool, address token) internal view returns (uint8 index) {
    if (token == address(0)) {
      token = Mainnet.EEE_ADDR;
    }

    for (; ; index++) {
      address coin;

      if (kind == 1) {
        coin = ICurvePoolKind1(pool).coins(index);
      } else if (kind == 2) {
        coin = ICurvePoolKind2(pool).coins(index);
      } else if (kind == 3) {
        coin = ICurvePoolKind3(pool).coins(index);
      } else if (kind == 4) {
        coin = ICurvePoolKind4(pool).coins(index);
      } else {
        require(false, 'UnhandledPoolKind');
      }

      if (coin == token) {
        return index;
      }
    }
  }

  function getUnderlyingIndex(
    uint8 kind,
    address pool,
    address token
  ) internal view returns (uint8 index) {
    for (; ; index++) {
      address coin;

      if (kind == 1) {
        coin = ICurvePoolKind1(pool).base_coins(index);
      } else if (kind == 2) {
        coin = ICurvePoolKind2(pool).base_coins(index);
      } else if (kind == 3) {
        coin = ICurvePoolKind3(pool).underlying_coins(index);
      } else {
        require(false, 'UnhandledPoolKind');
      }

      if (coin == token) {
        // The index is 1-based
        return index + 1;
      }
    }
  }
}
