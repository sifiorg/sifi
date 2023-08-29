// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import 'forge-std/Test.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Mainnet} from './helpers/Mainnet.sol';
import {IDiamondCut} from 'contracts/v2/interfaces/IDiamondCut.sol';
import {IUniV2Router} from 'contracts/v2/interfaces/IUniV2Router.sol';
import {UniV2RouterFacet} from 'contracts/v2/facets/UniV2RouterFacet.sol';
import {InitUniV2Router} from 'contracts/v2/init/InitUniV2Router.sol';

/**
 * @notice assertApproxRelEq is used in this test with a tolerance of 0.05 ether which equals to 5%
 */

contract UniV2RouterFacetTest is FacetTest {
  event CollectedFee(
    address indexed partner,
    address indexed token,
    uint256 partnerFee,
    uint256 diamondFee
  );

  IUniV2Router internal facet;
  uint256 private deadline;
  address USER = makeAddr('USER');
  address PARTNER = makeAddr('PARTNER');

  function setUp() public override {
    vm.createSelectFork(StdChains.getChain(1).rpcUrl, 17853419);

    super.setUp();

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);

    facet = new UniV2RouterFacet();

    facetCuts[0] = IDiamondCut.FacetCut(
      address(facet),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('UniV2RouterFacet')
    );

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(new InitUniV2Router()),
      abi.encodeWithSelector(InitUniV2Router.init.selector, Mainnet.UNISWAP_V2_ROUTER_02_ADDR)
    );

    facet = IUniV2Router(address(diamond));

    deadline = block.timestamp + 1000;
  }

  function testFork_uniswapV2SwapExactETHForTokens_EthForUsdc_PositiveSlippage() public {
    address[] memory path = new address[](2);
    path[0] = Mainnet.EEE_ADDR;
    path[1] = address(Mainnet.USDC);

    deal(USER, 1 ether);

    vm.prank(USER);
    facet.uniswapV2SwapExactETHForTokens{value: 1 ether}(
      1830 * (10 ** 6),
      path,
      payable(USER),
      50,
      deadline,
      address(0),
      0
    );

    assertApproxEqRel(Mainnet.USDC.balanceOf(USER), 1830 * (10 ** 6), 0.05 ether);
    assertApproxEqRel(Mainnet.USDC.balanceOf(address(facet)), 160_000, 0.05 ether);
  }

  function testFork_uniswapV2SwapExactETHForTokens_EthForUsdc_CollectFees() public {
    address[] memory path = new address[](2);
    path[0] = Mainnet.EEE_ADDR;
    path[1] = address(Mainnet.USDC);

    deal(USER, 1 ether);

    vm.expectEmit(true, true, true, false);
    emit CollectedFee(PARTNER, address(Mainnet.USDC), 1.83 * (10 ** 6), 1.83 * (10 ** 6));

    vm.prank(USER);
    facet.uniswapV2SwapExactETHForTokens{value: 1 ether}(
      1835 * (10 ** 6),
      path,
      USER,
      50,
      deadline,
      PARTNER,
      20
    );

    assertApproxEqRel(Mainnet.USDC.balanceOf(USER), 1830 * (10 ** 6), 0.05 ether);
    assertApproxEqRel(Mainnet.USDC.balanceOf(address(facet)), 3.5 * (10 ** 6), 0.05 ether);
  }

  function testFork_uniswapV2SwapExactTokensForTokens_UsdcForDai_SwapsOnePool() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    facet.uniswapV2SwapExactTokensForTokens(
      2000 * (10 ** 6),
      2000 * (10 ** 18),
      path,
      USER,
      50,
      deadline,
      address(0),
      0
    );

    assertApproxEqRel(Mainnet.DAI.balanceOf(USER), 2000 * (10 ** 18), 0.05 ether);
  }

  function testFork_uniswapV2SwapExactTokensForTokens_UsdcForDai_CollectFees() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, false);
    emit CollectedFee(PARTNER, address(Mainnet.DAI), 2 * (10 ** 18), 2 * (10 ** 18));

    facet.uniswapV2SwapExactTokensForTokens(
      2000 * (10 ** 6),
      2000 * (10 ** 18),
      path,
      USER,
      50,
      deadline,
      PARTNER,
      20
    );

    assertApproxEqRel(Mainnet.DAI.balanceOf(USER), 2000 * (10 ** 18), 0.05 ether);
    assertApproxEqRel(Mainnet.DAI.balanceOf(address(facet)), 4 * (10 ** 18), 0.05 ether);
  }

  function testFork_uniswapV2SwapExactTokensForETH_UsdcForEth_PositiveSlippage() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = Mainnet.EEE_ADDR;

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    facet.uniswapV2SwapExactTokensForETH(
      2000 * (10 ** 6),
      1.08 ether,
      path,
      payable(USER),
      50,
      deadline,
      address(0),
      0
    );

    assertApproxEqRel(USER.balance, 1.08 ether, 0.05 ether);
    assertApproxEqRel(address(facet).balance, 0.006 ether, 0.05 ether);
  }

  function testFork_uniswapV2SwapExactTokensForETH_UsdcForEth_CollectFees() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = Mainnet.EEE_ADDR;

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, false);
    emit CollectedFee(PARTNER, address(0), 0.004 ether, 0.004 ether);

    facet.uniswapV2SwapExactTokensForETH(
      2000 * (10 ** 6),
      1.08 ether,
      path,
      payable(USER),
      50,
      deadline,
      PARTNER,
      20
    );

    assertApproxEqRel(USER.balance, 1.08 ether, 0.05 ether);
    assertApproxEqRel(address(facet).balance, 0.008 ether, 0.05 ether);
  }

  receive() external payable {}
}
