// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import 'forge-std/Test.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Addresses, Mainnet, Polygon} from './helpers/Networks.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IUniV3Like} from 'contracts/interfaces/IUniV3Like.sol';
import {UniV3Like} from 'contracts/facets/UniV3Like.sol';
import {InitLibWarp} from 'contracts/init/InitLibWarp.sol';
import {UniV3Callback} from 'contracts/facets/UniV3Callback.sol';

abstract contract UniV3LikeTestBase is FacetTest {
  event CollectedFee(
    address indexed partner,
    address indexed token,
    uint256 partnerFee,
    uint256 diamondFee
  );

  IUniV3Like internal facet;
  uint48 internal deadline;
  address internal USER = makeAddr('User');
  address internal PARTNER = makeAddr('Partner');

  function setUpOn(uint256 chainId, uint256 blockNumber) internal override {
    super.setUpOn(chainId, blockNumber);

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](2);

    facetCuts[0] = IDiamondCut.FacetCut(
      address(new UniV3Callback()),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('UniV3Callback')
    );

    facetCuts[1] = IDiamondCut.FacetCut(
      address(new UniV3Like()),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('UniV3Like')
    );

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(new InitLibWarp()),
      abi.encodeWithSelector(InitLibWarp.init.selector, Addresses.weth(chainId))
    );

    facet = IUniV3Like(address(diamond));

    deadline = (uint48)(block.timestamp + 1000);
  }
}

contract UniV3LikeMainnetTest is UniV3LikeTestBase {
  function setUp() public override {
    super.setUpOn(1, 17853419);
  }

  function testFork_uniswapV3LikeExactInputSingle_UsdcToUsdt() public {
    deal(address(Mainnet.USDC), USER, 1000 * (10 ** 6));

    address pool = 0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf;

    vm.prank(USER);
    Mainnet.USDC.approve(address(facet), 1000 * (10 ** 6));

    vm.prank(USER);
    facet.uniswapV3LikeExactInputSingle(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 6),
        amountOut: 999 * (10 ** 6),
        recipient: USER,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.USDT),
        pool: pool
      })
    );

    assertEq(Mainnet.USDT.balanceOf(USER), 999 * (10 ** 6));
  }

  function testFork_uniswapV3LikeExactInputSingle_UsdcToEth() public {
    deal(address(Mainnet.USDC), USER, 1000 * (10 ** 6));

    // USDC/WETH, 0.3%
    address pool = 0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8;

    vm.prank(USER);
    Mainnet.USDC.approve(address(facet), 1000 * (10 ** 6));

    vm.prank(USER);
    facet.uniswapV3LikeExactInputSingle(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 6),
        amountOut: 544318039549018921,
        recipient: USER,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(0),
        pool: pool
      })
    );

    assertEq(USER.balance, 544318039549018921);
  }

  function testFork_uniswapV3LikeExactInputSingle_EthToUsdc() public {
    vm.deal(USER, 2 ether);

    // USDC/WETH, 0.3%
    address pool = 0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8;

    vm.prank(USER);
    facet.uniswapV3LikeExactInputSingle{value: 2 ether}(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 2 ether,
        amountOut: 3652264740,
        recipient: USER,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC),
        pool: pool
      })
    );

    assertEq(Mainnet.USDC.balanceOf(USER), 3652264740);
  }

  function testFork_uniswapV3LikeExactInput_UsdcUsdtEth() public {
    uint256 amountIn = 1000 * (10 ** 6);

    deal(address(Mainnet.USDC), USER, amountIn);

    address[] memory tokens = new address[](3);
    tokens[0] = address(Mainnet.USDC);
    tokens[1] = address(Mainnet.USDT);
    tokens[2] = address(0);

    address[] memory pools = new address[](2);
    pools[0] = 0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf;
    pools[1] = 0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36;

    uint256 amountOut = 544005533891390927;

    vm.prank(USER);
    Mainnet.USDC.approve(address(facet), amountIn);

    vm.prank(USER);
    facet.uniswapV3LikeExactInput(
      IUniV3Like.ExactInputParams({
        amountIn: amountIn,
        amountOut: amountOut,
        recipient: USER,
        slippageBps: 0,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokens: tokens,
        pools: pools
      })
    );

    assertEq(USER.balance, amountOut);
  }

  receive() external payable {}
}

contract UniV3LikePolygonTest is UniV3LikeTestBase {
  function setUp() public override {
    super.setUpOn(Polygon.CHAIN_ID, 47680788);
  }

  function testFork_uniswapV3LikeExactInputSingle_QuickswapV3UsdcToUsdt() public {
    address pool = 0x7B925e617aefd7FB3a93Abe3a701135D7a1Ba710;
    address tokenIn = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address tokenOut = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;

    deal(address(tokenIn), USER, 1000 * (10 ** 6));

    vm.prank(USER);
    IERC20(tokenIn).approve(address(facet), 1000 * (10 ** 6));

    vm.prank(USER);
    facet.uniswapV3LikeExactInputSingle(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 6),
        amountOut: 999 * (10 ** 6),
        recipient: USER,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        pool: pool
      })
    );

    assertEq(IERC20(tokenOut).balanceOf(USER), 999 * (10 ** 6));
  }
}
