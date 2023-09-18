// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Addresses, Mainnet, Arbitrum} from './helpers/Networks.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IUniV2Like} from 'contracts/interfaces/IUniV2Like.sol';
import {UniV2LikeFacet} from 'contracts/facets/UniV2LikeFacet.sol';
import {InitLibWarp} from 'contracts/init/InitLibWarp.sol';
import {Errors} from 'contracts/libraries/Errors.sol';
import {IUniswapV2Factory} from 'contracts/interfaces/external/IUniswapV2Factory.sol';

contract UniV2LikeFacetTestBase is FacetTest {
  event CollectedFee(
    address indexed partner,
    address indexed token,
    uint256 partnerFee,
    uint256 diamondFee
  );

  IUniV2Like internal facet;
  uint48 internal deadline;
  address internal USER = makeAddr('User');
  address internal PARTNER = makeAddr('Partner');

  function setUpOn(uint256 chainId, uint256 blockNumber) internal override {
    super.setUpOn(chainId, blockNumber);

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
      abi.encodeWithSelector(InitLibWarp.init.selector, Addresses.weth(chainId))
    );

    facet = IUniV2Like(address(diamond));

    deadline = (uint48)(block.timestamp + 1000);
  }

  function getPair(
    address factory,
    address tokenA,
    address tokenB
  ) internal view returns (address) {
    if (tokenA > tokenB) {
      (tokenA, tokenB) = (tokenB, tokenA);
    }

    return IUniswapV2Factory(factory).getPair(tokenA, tokenB);
  }
}

contract UniV2LikeFacetTest is UniV2LikeFacetTestBase {
  function setUp() public override {
    super.setUpOn(1, 17853419);
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

    uint16[] memory poolFeesBps = new uint16[](2);
    poolFeesBps[0] = 30;
    poolFeesBps[1] = 30;

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
        poolFeesBps: poolFeesBps
      })
    );

    assertEq(Mainnet.WBTC.balanceOf(USER), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2LikeExactInputSingle_PancakeV2EthUsdt() public {
    deal(USER, 0.001 ether);

    address pool = getPair(
      Mainnet.PANCAKESWAP_V2_FACTORY,
      address(Mainnet.WETH),
      address(Mainnet.USDT)
    );

    vm.prank(USER);
    facet.uniswapV2LikeExactInputSingle{value: 0.001 ether}(
      IUniV2Like.ExactInputSingleParams({
        amountIn: 0.001 ether,
        amountOut: 0,
        recipient: USER,
        slippageBps: 0,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDT),
        pool: pool,
        poolFeeBps: 25
      })
    );
  }

  function testFork_uniswapV2LikeExactInput_DifferentPoolFees() public {
    address[] memory tokens = new address[](3);
    tokens[0] = address(Mainnet.DAI);
    tokens[1] = address(Mainnet.WETH);
    tokens[2] = address(Mainnet.WBTC);

    address[] memory pools = new address[](2);
    pools[0] = getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.DAI), address(Mainnet.WETH));
    pools[1] = getPair(
      Mainnet.PANCAKESWAP_V2_FACTORY,
      address(Mainnet.WETH),
      address(Mainnet.WBTC)
    );

    uint16[] memory poolFeesBps = new uint16[](2);
    poolFeesBps[0] = 30;
    poolFeesBps[1] = 25;

    deal(address(Mainnet.DAI), USER, 2000 ether);

    vm.startPrank(USER);

    uint256 expectedSwapOut = 6737074;
    uint256 expectedFee = 0;

    Mainnet.DAI.approve(address(facet), 2000 ether);

    facet.uniswapV2LikeExactInput(
      IUniV2Like.ExactInputParams({
        amountIn: 2000 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        slippageBps: 0,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokens: tokens,
        pools: pools,
        poolFeesBps: poolFeesBps
      })
    );

    assertEq(Mainnet.WBTC.balanceOf(USER), expectedSwapOut - expectedFee);
  }

  receive() external payable {}
}

contract UniV2LikeFacetArbitrumTest is UniV2LikeFacetTestBase {
  function setUp() public override {
    super.setUpOn(42161, 130346515);
  }

  function testFork_uniswapV2LikeExactInputSingle() public {
    // deal(USER, 1 ether);

    address pool = 0x57b85FEf094e10b5eeCDF350Af688299E9553378;

    vm.prank(0x0938C63109801Ee4243a487aB84DFfA2Bba4589e);
    facet.uniswapV2LikeExactInputSingle{value: 1 ether}(
      IUniV2Like.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 130346515,
        recipient: USER,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(0),
        tokenOut: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831,
        pool: pool,
        poolFeeBps: 0x1e
      })
    );

    assertApproxEqRel(Arbitrum.USDC.balanceOf(USER), 130346515, 0.05 ether);
  }

  receive() external payable {}
}
