// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import 'forge-std/Test.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Mainnet} from './helpers/Mainnet.sol';
import {IDiamondCut} from 'contracts/v2/interfaces/IDiamondCut.sol';
import {UniV2RouterFacet} from 'contracts/v2/facets/UniV2RouterFacet.sol';
import {IUniV2RouterFacet} from 'contracts/v2/interfaces/IUniV2RouterFacet.sol';

contract UniV2RouterFacetTest is FacetTest {
  IUniV2RouterFacet internal facet;
  uint256 private deadline;

  function setUp() public override {
    vm.createSelectFork(StdChains.getChain(1).rpcUrl, 17853419);

    super.setUp();

    // Add UniV2RouterFacet to diamond
    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);

    facet = new UniV2RouterFacet();

    facetCuts[0] = IDiamondCut.FacetCut(
      address(facet),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('UniV2RouterFacet')
    );

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(facet),
      abi.encodeWithSelector(facet.initUniV2Router.selector, Mainnet.UNISWAP_V2_ROUTER_02_ADDR)
    );

    facet = IUniV2RouterFacet(address(diamond));

    deadline = block.timestamp + 1000;
  }

  function testFork_uniswapV2SwapExactETHForTokens_PositiveSlippage() public {
    address[] memory path = new address[](2);
    path[0] = Mainnet.EEE_ADDR;
    path[1] = address(Mainnet.USDC);

    deal(address(this), 1 ether);

    uint256 balBefore = Mainnet.USDC.balanceOf(address(facet));

    facet.uniswapV2SwapExactETHForTokens{value: 1 ether}(
      1830 * (10 ** 6),
      path,
      payable(this),
      50,
      deadline
    );

    uint256 balAfter = Mainnet.USDC.balanceOf(address(facet));

    assertApproxEqRel(Mainnet.USDC.balanceOf(address(this)), 1835 * (10 ** 6), 0.05 ether);
    assertApproxEqRel(balAfter - balBefore, 160_000, 0.05 ether);
  }

  function testFork_uniswapV2SwapExactTokensForTokens_SwapsOnePool() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), address(this), 2000 * (10 ** 6));

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    facet.uniswapV2SwapExactTokensForTokens(
      2000 * (10 ** 6),
      2000 * (10 ** 18),
      path,
      address(this),
      50,
      deadline
    );

    assertApproxEqRel(Mainnet.DAI.balanceOf(address(this)), 2000 * (10 ** 18), 0.05 ether);
  }

  function testFork_uniswapV2SwapExactTokensForETH_UsdcForEth() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = Mainnet.EEE_ADDR;

    uint256 balBefore = address(this).balance;

    deal(address(Mainnet.USDC), address(this), 2000 * (10 ** 6));

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    facet.uniswapV2SwapExactTokensForETH(
      2000 * (10 ** 6),
      1.09 ether,
      path,
      payable(this),
      50,
      deadline
    );

    uint256 balAfter = address(this).balance;

    assertApproxEqRel(balAfter - balBefore, 1.09 ether, 0.05 ether);
  }

  receive() external payable {}
}
