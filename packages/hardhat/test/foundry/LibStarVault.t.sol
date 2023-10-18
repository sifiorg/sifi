// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// TODO: Add tests for registerAndCollectFee

import 'forge-std/Test.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {LibStarVault} from 'contracts/libraries/LibStarVault.sol';
import {ILibStarVault} from 'contracts/interfaces/ILibStarVault.sol';
import {Mainnet} from './helpers/Networks.sol';

contract LibStarVaultTest is Test, ILibStarVault {
  using EnumerableSet for EnumerableSet.AddressSet;

  function test_registerCollectedFee_Vector1() public {
    // NOTE: The storage is this test contract
    LibStarVault.State storage s = LibStarVault.state();

    address PARTNER_1 = address(0x1);
    address PARTNER_2 = address(0x2);

    // Collect 101 units of USDC for partner PARTNER_1
    vm.expectEmit(true, true, true, true);
    emit Fee(PARTNER_1, address(Mainnet.USDC), 50, 51);
    LibStarVault.registerCollectedFee(PARTNER_1, address(Mainnet.USDC), 50, 51);

    assertEq(s.partners.length(), 1);
    assertEq(s.partners.at(0), address(PARTNER_1));
    assertEq(s.partnerBalances[PARTNER_1][address(Mainnet.USDC)], 50);
    assertEq(s.partnerBalancesTotal[address(Mainnet.USDC)], 50);

    // Collect 22 units of USDC for partner PARTNER_2
    LibStarVault.registerCollectedFee(PARTNER_2, address(Mainnet.USDC), 11, 11);

    assertEq(s.partners.length(), 2);
    assertEq(s.partners.at(0), address(PARTNER_1));
    assertEq(s.partners.at(1), address(PARTNER_2));
    assertEq(s.partnerBalances[PARTNER_1][address(Mainnet.USDC)], 50);
    assertEq(s.partnerBalances[PARTNER_2][address(Mainnet.USDC)], 11);
    assertEq(s.partnerBalancesTotal[address(Mainnet.USDC)], 61);

    // Collect 33 units of ETH for partner PARTNER_1
    LibStarVault.registerCollectedFee(PARTNER_1, address(0), 33, 0);

    assertEq(s.partners.length(), 2);
    assertEq(s.partners.at(0), address(PARTNER_1));
    assertEq(s.partners.at(1), address(PARTNER_2));
    assertEq(s.partnerBalances[PARTNER_1][address(Mainnet.USDC)], 50);
    assertEq(s.partnerBalances[PARTNER_1][address(0)], 33);
    assertEq(s.partnerBalances[PARTNER_2][address(Mainnet.USDC)], 11);
    assertEq(s.partnerBalancesTotal[address(Mainnet.USDC)], 61);
    assertEq(s.partnerBalancesTotal[address(0)], 33);
  }

  // With partner, 0.15% fee, and negative slippage
  function test_calculateAndRegisterFee_1() public {
    address partner = makeAddr('partner');

    vm.expectEmit(true, true, true, true);
    emit Fee(partner, address(Mainnet.USDC), 71250, 71250);

    // The total fee is 0.15% of the actual output 95_000000, 142500 (0.1425 USDC)
    // Site and partner gets half, 71250 units each
    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      partner,
      address(Mainnet.USDC),
      15, // 0.15% fee
      100_000000, // User was quoted 100 USDC
      95_000000 // Swap output was 95 USDC
    );

    assertEq(amountOutUser, 95_000000 - 142500);
  }

  // With partner, 0.23% fee, and positive slippage
  function test_calculateAndRegisterFee_2() public {
    address partner = makeAddr('partner');

    // Positive slippage
    uint256 expectedFeeTotal = (95_000000 - 90_000000);

    expectedFeeTotal += (90_000000 * 23) / 10_000;

    vm.expectEmit(true, true, true, true);
    emit Fee(partner, address(Mainnet.USDC), expectedFeeTotal / 2, expectedFeeTotal / 2);

    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      partner,
      address(Mainnet.USDC),
      23, // 0.23% fee
      90_000000, // User was quoted 90 USDC
      95_000000 // Swap output was 95 USDC
    );

    assertEq(amountOutUser, 95_000000 - expectedFeeTotal);
  }

  // With partner, 0% fee, and positive slippage
  function test_calculateAndRegisterFee_3() public {
    address partner = makeAddr('partner');

    // Positive slippage
    uint256 expectedFeeTotal = (95_000000 - 90_000000);

    vm.expectEmit(true, true, true, true);
    emit Fee(partner, address(Mainnet.USDC), expectedFeeTotal / 2, expectedFeeTotal / 2);

    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      partner,
      address(Mainnet.USDC),
      0, // 0% fee
      90_000000, // User was quoted 90 USDC
      95_000000 // Swap output was 95 USDC
    );

    assertEq(amountOutUser, 95_000000 - expectedFeeTotal);
  }

  // With partner, 0.15% fee, and no slippage
  function test_calculateAndRegisterFee_4() public {
    address partner = makeAddr('partner');

    uint256 expectedFeeTotal = (100_000000 * 15) / 10_000;

    vm.expectEmit(true, true, true, true);
    emit Fee(partner, address(Mainnet.USDC), expectedFeeTotal / 2, expectedFeeTotal / 2);

    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      partner,
      address(Mainnet.USDC),
      15, // 0.15% fee
      100_000000, // User was quoted 100 USDC
      100_000000 // Swap output was 100 USDC
    );

    assertEq(amountOutUser, 100_000000 - expectedFeeTotal);
  }

  // With no partner, 0.15% fee, and no slippage
  function test_calculateAndRegisterFee_5() public {
    uint256 expectedFeeTotal = (100_000000 * 15) / 10_000;

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.USDC), 0, expectedFeeTotal);

    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      address(0),
      address(Mainnet.USDC),
      15, // 0.15% fee
      100_000000, // User was quoted 100 USDC
      100_000000 // Swap output was 100 USDC
    );

    assertEq(amountOutUser, 100_000000 - expectedFeeTotal);
  }

  // With no partner, 0% fee, and no slippage
  function test_calculateAndRegisterFee_6() public {
    uint256 expectedFeeTotal = 0;

    vm.recordLogs();

    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      address(0),
      address(Mainnet.USDC),
      0,
      100_000000, // User was quoted 100 USDC
      100_000000 // Swap output was 100 USDC
    );

    assertEq(vm.getRecordedLogs().length, 0, 'expected no logs');
    assertEq(amountOutUser, 100_000000 - expectedFeeTotal);
  }

  // With no partner, 0.15% fee, and positive slippage
  function test_calculateAndRegisterFee_7() public {
    // Positive slippage
    uint256 expectedFeeTotal = (105_000000 - 100_000000);

    expectedFeeTotal += (100_000000 * 15) / 10_000;

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.USDC), 0, expectedFeeTotal);

    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      address(0),
      address(Mainnet.USDC),
      15, // 0.15% fee
      100_000000, // User was quoted 100 USDC
      105_000000 // Swap output was 105 USDC
    );

    assertEq(amountOutUser, 105_000000 - expectedFeeTotal);
  }

  // With no partner, 0.05% fee, and no slippage. Fee is rounded to 0
  function test_calculateAndRegisterFee_8() public {
    uint256 expectedFeeTotal = 0;

    vm.recordLogs();

    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      address(0),
      address(Mainnet.USDC),
      5,
      1000, // User was quoted 1000 units
      1000 // Swap output was 1000 units
    );

    assertEq(vm.getRecordedLogs().length, 0, 'expected no logs');
    assertEq(amountOutUser, 1000 - expectedFeeTotal);
  }

  // With partner, 0.25% fee, and no slippage. Uneven fee spit between partner and diamond
  function test_calculateAndRegisterFee_9() public {
    address partner = makeAddr('partner');

    uint256 expectedFeeTotal = (1200 * 25) / 10_000;

    vm.expectEmit(true, true, true, true);
    emit Fee(partner, address(Mainnet.USDC), expectedFeeTotal / 2, expectedFeeTotal / 2 + 1);

    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      partner,
      address(Mainnet.USDC),
      25, // 0.25% fee
      1200, // User was quoted 1200 units
      1200 // Swap output was 1200 units
    );

    assertEq(amountOutUser, 1200 - expectedFeeTotal);
  }

  function test_calculateAndRegisterFee_PartnerFeeTooHigh() public {
    address partner = makeAddr('partner');

    vm.expectRevert(abi.encodeWithSelector(LibStarVault.FeeTooHigh.selector, 2000));

    uint256 amountOutUser = LibStarVault.calculateAndRegisterFee(
      partner,
      address(Mainnet.USDC),
      20_000, // 200%
      1200,
      1200
    );
  }
}
