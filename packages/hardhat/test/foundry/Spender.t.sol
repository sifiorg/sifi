// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Strings} from '@openzeppelin/contracts/utils/Strings.sol';
import './helpers/TestHelperContract.t.sol';

contract TransferFrom is TestHelperContract {
  address authorizeTestAddress = makeAddr('authorizeTestAddress');

  function setUp() public {}

  function test_RevertMissingRole_TransferFrom() public {
    hoax(authorizeTestAddress);

    vm.expectRevert(
      abi.encodePacked(
        'AccessControl: account ',
        Strings.toHexString(address(authorizeTestAddress)),
        ' is missing role ',
        Strings.toHexString(uint256(keccak256('TRANSFER_ROLE')), 32)
      )
    );

    spender.transferFrom(address(USDC), USDCWHALEADDRESS, address(authorizeTestAddress), AMOUNT);
  }

  function test_TransferFrom() public {
    spender.grantRole(keccak256('TRANSFER_ROLE'), address(authorizeTestAddress));

    hoax(USDCWHALEADDRESS);
    USDC.approve(address(spender), AMOUNT);

    hoax(authorizeTestAddress);
    spender.transferFrom(address(USDC), USDCWHALEADDRESS, address(authorizeTestAddress), AMOUNT);

    assertEq(USDC.balanceOf(address(authorizeTestAddress)), AMOUNT);
  }
}
