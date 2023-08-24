// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import 'forge-std/Test.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {LibKitty} from 'contracts/v2/libraries/LibKitty.sol';
import {Mainnet} from './helpers/Mainnet.sol';

contract LibKittyTest is Test {
  using EnumerableSet for EnumerableSet.AddressSet;

  event CollectedFee(
    address indexed partner,
    address indexed token,
    uint256 partnerFee,
    uint256 diamondFee
  );

  function test_registerCollectedFee_Vector1() public {
    // NOTE: The storage is this test contract
    LibKitty.State storage s = LibKitty.state();

    address PARTNER_1 = address(0x1);
    address PARTNER_2 = address(0x2);

    // Collect 101 units of USDC for partner PARTNER_1
    vm.expectEmit(true, true, true, true);
    emit CollectedFee(PARTNER_1, address(Mainnet.USDC), 50, 51);
    LibKitty.registerCollectedFee(PARTNER_1, address(Mainnet.USDC), 50, 51);

    assertEq(s.partners.length(), 1);
    assertEq(s.partners.at(0), address(PARTNER_1));
    assertEq(s.partnerBalances[PARTNER_1][address(Mainnet.USDC)], 50);
    assertEq(s.partnerBalancesTotal[address(Mainnet.USDC)], 50);

    // Collect 22 units of USDC for partner PARTNER_2
    LibKitty.registerCollectedFee(PARTNER_2, address(Mainnet.USDC), 11, 11);

    assertEq(s.partners.length(), 2);
    assertEq(s.partners.at(0), address(PARTNER_1));
    assertEq(s.partners.at(1), address(PARTNER_2));
    assertEq(s.partnerBalances[PARTNER_1][address(Mainnet.USDC)], 50);
    assertEq(s.partnerBalances[PARTNER_2][address(Mainnet.USDC)], 11);
    assertEq(s.partnerBalancesTotal[address(Mainnet.USDC)], 61);

    // Collect 33 units of ETH for partner PARTNER_1
    LibKitty.registerCollectedFee(PARTNER_1, address(0), 33, 0);

    assertEq(s.partners.length(), 2);
    assertEq(s.partners.at(0), address(PARTNER_1));
    assertEq(s.partners.at(1), address(PARTNER_2));
    assertEq(s.partnerBalances[PARTNER_1][address(Mainnet.USDC)], 50);
    assertEq(s.partnerBalances[PARTNER_1][address(0)], 33);
    assertEq(s.partnerBalances[PARTNER_2][address(Mainnet.USDC)], 11);
    assertEq(s.partnerBalancesTotal[address(Mainnet.USDC)], 61);
    assertEq(s.partnerBalancesTotal[address(0)], 33);
  }
}
