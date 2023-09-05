// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import 'forge-std/Test.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Mainnet} from './helpers/Mainnet.sol';
import {IDiamondCut} from 'contracts/v2/interfaces/IDiamondCut.sol';
import {IUniV2Like} from 'contracts/v2/interfaces/IUniV2Like.sol';
import {UniV2LikeFacet} from 'contracts/v2/facets/UniV2LikeFacet.sol';
import {InitLibWarp} from 'contracts/v2/init/InitLibWarp.sol';
import {Errors} from 'contracts/v2/libraries/Errors.sol';
import {IUniswapV2Factory} from 'contracts/v2/interfaces/external/IUniswapV2Factory.sol';

contract UniV2LikeFacetTest is FacetTest {
  event CollectedFee(
    address indexed partner,
    address indexed token,
    uint256 partnerFee,
    uint256 diamondFee
  );

  IUniV2Like internal facet;
  uint48 private deadline;
  address USER = makeAddr('User');
  address PARTNER = makeAddr('Partner');

  function setUp() public override {
    vm.createSelectFork(StdChains.getChain(1).rpcUrl, 17853419);

    super.setUp();

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);

    facet = new UniV2LikeFacet();

    facetCuts[0] = IDiamondCut.FacetCut(
      address(facet),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('UniV2LikeFacet')
    );

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(new InitLibWarp()),
      abi.encodeWithSelector(InitLibWarp.init.selector, Mainnet.WETH)
    );

    facet = IUniV2Like(address(diamond));

    deadline = (uint48)(block.timestamp + 1000);
  }

  function getPair(address factory, address tokenA, address tokenB) private view returns (address) {
    if (tokenA > tokenB) {
      (tokenA, tokenB) = (tokenB, tokenA);
    }

    return IUniswapV2Factory(factory).getPair(tokenA, tokenB);
  }

  function testFork_uniswapV2LikeExactInputSingle() public {
    deal(USER, 1 ether);

    address pool = getPair(
      Mainnet.SUSHISWAP_V2_FACTORY,
      address(Mainnet.WETH),
      address(Mainnet.USDC)
    );

    vm.prank(USER);
    facet.uniswapV2LikeExactInputSingle{value: 1 ether}(
      IUniV2Like.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1830 * (10 ** 6),
        recipient: USER,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC),
        pool: pool,
        poolFeeBps: 30
      })
    );
  }

  function testFork_uniswapV2LikeExactInput_DaiWethWbtc() public {
    address[] memory tokens = new address[](3);
    tokens[0] = address(Mainnet.DAI);
    tokens[1] = address(Mainnet.WETH);
    tokens[2] = address(Mainnet.WBTC);

    address[] memory pools = new address[](2);
    pools[0] = getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.DAI), address(Mainnet.WETH));
    pools[1] = getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.WETH), address(Mainnet.WBTC));

    deal(address(Mainnet.DAI), USER, 2000 ether);

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1234;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.DAI.approve(address(facet), 2000 ether);

    facet.uniswapV2LikeExactInput(
      IUniV2Like.ExactInputParams({
        amountIn: 2000 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        slippageBps: 0,
        feeBps: 10,
        deadline: deadline,
        partner: address(0),
        tokens: tokens,
        pools: pools,
        poolFeeBps: 30
      })
    );

    assertEq(Mainnet.WBTC.balanceOf(USER), expectedSwapOut - expectedFee);
  }

  receive() external payable {}
}
