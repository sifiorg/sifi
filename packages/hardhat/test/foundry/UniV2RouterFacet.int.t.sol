// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import 'forge-std/Test.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Mainnet} from './helpers/Mainnet.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IUniV2Router} from 'contracts/interfaces/IUniV2Router.sol';
import {UniV2RouterFacet} from 'contracts/facets/UniV2RouterFacet.sol';
import {InitUniV2Router} from 'contracts/init/InitUniV2Router.sol';
import {IKitty} from 'contracts/interfaces/IKitty.sol';
import {KittyFacet} from 'contracts/facets/KittyFacet.sol';
import {LibKitty} from 'contracts/libraries/LibKitty.sol';
import {Errors} from 'contracts/libraries/Errors.sol';

contract UniV2RouterIntegrationTest is FacetTest {
  event PartnerWithdraw(address indexed partner, address indexed token, uint256 amount);

  address PARTNER = address(0xdeadbeef9023480492001);
  address USER = makeAddr('USER');
  address VAULT = makeAddr('VAULT');

  IUniV2Router internal uniV2Router;
  IKitty internal kitty;

  uint256 private deadline;

  function setUp() public override {
    vm.createSelectFork(StdChains.getChain(1).rpcUrl, 17853419);

    super.setUp();

    deadline = block.timestamp + 1000;

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](2);

    UniV2RouterFacet uniV2RouterFacet = new UniV2RouterFacet();
    KittyFacet kittyFacet = new KittyFacet();

    facetCuts[0] = IDiamondCut.FacetCut(
      address(uniV2RouterFacet),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('UniV2RouterFacet')
    );

    facetCuts[1] = IDiamondCut.FacetCut(
      address(kittyFacet),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('KittyFacet')
    );

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(new InitUniV2Router()),
      abi.encodeWithSelector(
        InitUniV2Router.init.selector,
        Mainnet.UNISWAP_V2_ROUTER_02_ADDR,
        Mainnet.UNISWAP_V2_FACTORY_ADDR
      )
    );

    kitty = IKitty(address(diamond));
    uniV2Router = IUniV2Router(address(diamond));
  }

  function testFork_swapEthForUsdc() public {
    address[] memory path = new address[](2);
    path[0] = address(0);
    path[1] = address(Mainnet.USDC);

    deal(USER, 1 ether);

    vm.prank(USER);

    uniV2Router.uniswapV2ExactInput{value: 1 ether}(
      IUniV2Router.ExactInputParams({
        amountIn: 1 ether,
        amountOut: 1830 * (10 ** 6),
        recipient: USER,
        slippage: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: PARTNER,
        path: path
      })
    );

    // From Swap event log
    uint256 amountOutActual = 1830163503;
    uint256 expectedFeeTotal = amountOutActual - 1826340000;

    assertEq(Mainnet.USDC.balanceOf(USER), 1826340000, 'swapper usdc after');
    assertEq(Mainnet.USDC.balanceOf(address(diamond)), expectedFeeTotal, 'diamond usdc after');
    assertEq(
      kitty.partnerTokenBalance(PARTNER, address(Mainnet.USDC)),
      expectedFeeTotal / 2,
      'partner usdc after'
    );

    vm.prank(PARTNER);
    vm.expectEmit(true, true, true, false);
    emit PartnerWithdraw(PARTNER, address(Mainnet.USDC), 100);
    kitty.partnerWithdraw(address(Mainnet.USDC));

    assertApproxEqRel(Mainnet.USDC.balanceOf(PARTNER), expectedFeeTotal / 2, 0.05 ether);

    vm.expectRevert(abi.encodeWithSelector(KittyFacet.InsufficientOwnerBalance.selector, 1911752));
    kitty.ownerWithdraw(address(Mainnet.USDC), (expectedFeeTotal / 2) + 10, payable(VAULT));

    kitty.ownerWithdraw(address(Mainnet.USDC), (expectedFeeTotal / 2) - 1, payable(VAULT));
    assertApproxEqRel(Mainnet.USDC.balanceOf(VAULT), (expectedFeeTotal / 2) - 1, 0.05 ether);
  }

  function testFork_swapUsdcForEth() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(0);

    uint256 balBefore = USER.balance;

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    Mainnet.USDC.approve(address(diamond), 2000 * (10 ** 6));

    uniV2Router.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 1.08 ether,
        recipient: USER,
        slippage: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: PARTNER,
        path: path
      })
    );

    vm.stopPrank();

    uint256 balAfter = USER.balance;

    assertApproxEqRel(balAfter - balBefore, 1.08 ether, 0.05 ether);
    assertApproxEqRel(
      kitty.partnerTokenBalance(PARTNER, address(Mainnet.WETH)),
      0.004 ether,
      0.05 ether
    );
    assertApproxEqRel(Mainnet.WETH.balanceOf(address(diamond)), 0.008 ether, 0.05 ether);

    vm.prank(PARTNER);
    vm.expectEmit(true, true, true, false);
    emit PartnerWithdraw(PARTNER, address(Mainnet.WETH), 100);
    kitty.partnerWithdraw(address(Mainnet.WETH));
    assertApproxEqRel(Mainnet.WETH.balanceOf(PARTNER), 0.004 ether, 0.05 ether);

    vm.expectRevert(
      abi.encodeWithSelector(KittyFacet.InsufficientOwnerBalance.selector, 4137565610928260)
    );
    kitty.ownerWithdraw(address(Mainnet.WETH), 0.005 ether, payable(VAULT));

    kitty.ownerWithdraw(address(Mainnet.WETH), 0.003 ether, payable(VAULT));
    assertApproxEqRel(Mainnet.WETH.balanceOf(VAULT), 0.003 ether, 0.05 ether);
  }

  function testFork_swapUsdcForDai() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    // approve and swap as user
    vm.startPrank(USER);

    Mainnet.USDC.approve(address(diamond), 2000 * (10 ** 6));

    uniV2Router.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 1900 * (10 ** 18),
        recipient: USER,
        slippage: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: PARTNER,
        path: path
      })
    );

    vm.stopPrank();

    assertApproxEqRel(Mainnet.DAI.balanceOf(USER), 1900 * (10 ** 18), 0.05 ether);
    assertApproxEqRel(Mainnet.DAI.balanceOf(address(diamond)), 100 * (10 ** 18), 0.05 ether);
    assertApproxEqRel(
      kitty.partnerTokenBalance(PARTNER, address(Mainnet.DAI)),
      50 * (10 ** 18),
      0.05 ether
    );

    vm.prank(PARTNER);
    vm.expectEmit(true, true, true, false);
    emit PartnerWithdraw(PARTNER, address(Mainnet.DAI), 50 * (10 ** 18));
    kitty.partnerWithdraw(address(Mainnet.DAI));

    assertApproxEqRel(Mainnet.DAI.balanceOf(PARTNER), 50 * (10 ** 18), 0.05 ether);

    vm.expectRevert(
      abi.encodeWithSelector(KittyFacet.InsufficientOwnerBalance.selector, 47823223316479588619)
    );
    kitty.ownerWithdraw(address(Mainnet.DAI), 50 * (10 ** 18), payable(VAULT));

    kitty.ownerWithdraw(address(Mainnet.DAI), 45 * (10 ** 18), payable(VAULT));
    assertApproxEqRel(Mainnet.DAI.balanceOf(VAULT), 45 * (10 ** 18), 0.05 ether);
  }

  receive() external payable {}
}
