// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FacetTest} from './helpers/FacetTest.sol';
import {IERC173} from 'contracts/interfaces/IERC173.sol';

contract OwnershipFacetTest is FacetTest {
  function test_Owner() public {
    IERC173 ierc173 = IERC173(address(diamond));

    assertEq(ierc173.owner(), address(this));
  }
}
