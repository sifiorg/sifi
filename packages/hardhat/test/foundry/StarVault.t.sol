// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Mainnet} from './helpers/Networks.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IUniV2Router} from 'contracts/interfaces/IUniV2Router.sol';
import {StarVault} from 'contracts/facets/StarVault.sol';
import {LibStarVault} from 'contracts/libraries/LibStarVault.sol';

contract StarVaultHarness is StarVault {
  function exposed_registerCollectedFee(
    address partner,
    address token,
    uint256 amount,
    uint256 amountIn
  ) public {
    LibStarVault.registerCollectedFee(partner, token, amount, amountIn);
  }
}

contract StarVaultTest is FacetTest {
  event Withdraw(address indexed partner, address indexed token, uint256 amount);

  address PARTNER_1 = address(0xdeadbeef9023480492001);
  address PARTNER_2 = address(0xdeadbeef9023480492002);
  address PARTNER_3 = address(0xdeadbeef9023480492003);

  StarVaultHarness internal facet;

  function collectFeeFromAir(address partner, address token, uint256 amount) internal {
    uint256 site = amount + 1;
    uint256 total = amount + site;

    if (token == address(0)) {
      deal(address(diamond), address(diamond).balance + total);
    } else {
      deal(token, address(diamond), IERC20(token).balanceOf(address(diamond)) + total);
    }

    facet.exposed_registerCollectedFee(partner, token, amount, site);
  }

  function setUp() public override {
    setUpOn(Mainnet.CHAIN_ID, 17853419);

    // Add StarVault to diamond
    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);

    StarVaultHarness starVault = new StarVaultHarness();

    facetCuts[0] = IDiamondCut.FacetCut(
      address(starVault),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('StarVaultHarness')
    );

    IDiamondCut(address(diamond)).diamondCut(facetCuts, address(0), '');

    facet = StarVaultHarness(address(diamond));
  }

  function testFork_partnerWithdrawTokens() public {
    // Collect 100 units of USDC for partner 2
    collectFeeFromAir(PARTNER_1, address(Mainnet.USDC), 100);

    // Collect 200 units of USDC for partner 2
    collectFeeFromAir(PARTNER_2, address(Mainnet.USDC), 200);

    // Collect 300 units of ETH for partner 2
    collectFeeFromAir(PARTNER_2, address(0), 300);

    assertEq(Mainnet.USDC.balanceOf(address(diamond)), 100 + 101 + 200 + 201, 'diamond usdc prev');
    assertEq(address(diamond).balance, 300 + 301, 'diamond eth prev');

    // Withdraw the USDC balance for partner 1
    vm.expectEmit(true, true, true, false);
    emit Withdraw(PARTNER_1, address(Mainnet.USDC), 100);
    vm.prank(PARTNER_1);
    facet.partnerWithdraw(address(Mainnet.USDC));

    assertEq(
      facet.partnerTokenBalance(PARTNER_1, address(Mainnet.USDC)),
      0,
      'partner1 usdc balance'
    );
    assertEq(Mainnet.USDC.balanceOf(PARTNER_1), 100, 'partner1 usdc after');
    assertEq(Mainnet.USDC.balanceOf(address(diamond)), 101 + 200 + 201, 'diamond usdc after');
  }

  function testFork_partnerWithdrawETH() public {
    // Collect 100 units of USDC for partner 1
    collectFeeFromAir(PARTNER_1, address(Mainnet.USDC), 100);

    // Collect 200 units of USDC for partner 2
    collectFeeFromAir(PARTNER_2, address(Mainnet.USDC), 200);

    // Collect 300 units of ETH for partner 2
    collectFeeFromAir(PARTNER_2, address(0), 300);

    // Withdraw the ETH balance for partner 2
    vm.expectEmit(true, true, true, false);
    emit Withdraw(PARTNER_2, address(0), 300);
    vm.prank(PARTNER_2);
    facet.partnerWithdraw(address(0));

    assertEq(PARTNER_2.balance, 300);
  }

  function testFork_partnerTokenBalance() public {
    // Collect 50 units of DAI for PARTNER_1
    facet.exposed_registerCollectedFee(PARTNER_1, address(Mainnet.DAI), 50, 0);

    // Collect 125 units of ETH for PARTNER_1
    facet.exposed_registerCollectedFee(PARTNER_1, address(0), 125, 0);

    // Collect 100 units of USDC for PARTNER_2
    facet.exposed_registerCollectedFee(PARTNER_2, address(Mainnet.USDC), 100, 0);

    assertEq(facet.partnerTokenBalance(PARTNER_1, address(Mainnet.DAI)), 50);
    assertEq(facet.partnerTokenBalance(PARTNER_1, address(0)), 125);
    assertEq(facet.partnerTokenBalance(PARTNER_2, address(Mainnet.USDC)), 100);
  }

  function testFork_ownerWithdraw() public {
    // Collect 100 units of USDC for partner 1
    collectFeeFromAir(PARTNER_1, address(Mainnet.USDC), 100);

    // Expect fail, not owner
    vm.expectRevert();
    vm.prank(PARTNER_1);
    facet.ownerWithdraw(address(Mainnet.USDC), 1, payable(this));

    facet.ownerWithdraw(address(Mainnet.USDC), 101, payable(this));

    assertEq(Mainnet.USDC.balanceOf(address(this)), 101);

    // Expect fail, no balance left to withdraw
    vm.expectRevert();
    facet.ownerWithdraw(address(Mainnet.USDC), 1, payable(this));
  }

  receive() external payable {}
}
