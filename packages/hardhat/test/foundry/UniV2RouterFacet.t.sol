// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import 'forge-std/Test.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Mainnet} from './helpers/Mainnet.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IUniV2Router} from 'contracts/interfaces/IUniV2Router.sol';
import {UniV2RouterFacet} from 'contracts/facets/UniV2RouterFacet.sol';
import {InitUniV2Router} from 'contracts/init/InitUniV2Router.sol';
import {Errors} from 'contracts/libraries/Errors.sol';

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
      abi.encodeWithSelector(
        InitUniV2Router.init.selector,
        Mainnet.UNISWAP_V2_ROUTER_02_ADDR,
        Mainnet.UNISWAP_V2_FACTORY_ADDR
      )
    );

    facet = IUniV2Router(address(diamond));

    deadline = block.timestamp + 1000;
  }

  function testFork_uniswapV2ExactInputSingle_EthForUsdc_PositiveSlippage() public {
    deal(USER, 1 ether);

    vm.prank(USER);
    facet.uniswapV2ExactInputSingle{value: 1 ether}(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1830 * (10 ** 6),
        recipient: USER,
        slippage: 50,
        feeBps: 0,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC)
      })
    );

    assertApproxEqRel(Mainnet.USDC.balanceOf(USER), 1830 * (10 ** 6), 0.05 ether);
    assertApproxEqRel(Mainnet.USDC.balanceOf(address(facet)), 160_000, 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_EthForUsdc_CollectFees() public {
    deal(USER, 1 ether);

    vm.expectEmit(true, true, true, false);
    emit CollectedFee(PARTNER, address(Mainnet.USDC), 1.83 * (10 ** 6), 1.83 * (10 ** 6));

    vm.prank(USER);
    facet.uniswapV2ExactInputSingle{value: 1 ether}(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1835 * (10 ** 6),
        recipient: USER,
        slippage: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: PARTNER,
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC)
      })
    );

    assertApproxEqRel(Mainnet.USDC.balanceOf(USER), 1830 * (10 ** 6), 0.05 ether);
    assertApproxEqRel(Mainnet.USDC.balanceOf(address(facet)), 3.5 * (10 ** 6), 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForDai_SwapsOnePool() public {
    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 2000 * (10 ** 18),
        recipient: USER,
        slippage: 50,
        feeBps: 0,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      })
    );

    assertApproxEqRel(Mainnet.DAI.balanceOf(USER), 2000 * (10 ** 18), 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForDai_CollectFees() public {
    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, false);
    emit CollectedFee(PARTNER, address(Mainnet.DAI), 2 * (10 ** 18), 2 * (10 ** 18));

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 2000 * (10 ** 18),
        recipient: USER,
        slippage: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: PARTNER,
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      })
    );

    assertApproxEqRel(Mainnet.DAI.balanceOf(USER), 2000 * (10 ** 18), 0.05 ether);
    assertApproxEqRel(Mainnet.DAI.balanceOf(address(facet)), 4 * (10 ** 18), 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForEth_PositiveSlippage() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(0);

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 1.08 ether,
        recipient: USER,
        slippage: 50,
        feeBps: 0,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(0)
      })
    );

    assertApproxEqRel(USER.balance, 1.08 ether, 0.05 ether);
    assertApproxEqRel(Mainnet.WETH.balanceOf(address(facet)), 0.006 ether, 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForEth_CollectFees() public {
    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, false);
    emit CollectedFee(PARTNER, address(Mainnet.WETH), 0.004 ether, 0.004 ether);

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 1.08 ether,
        recipient: USER,
        slippage: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: PARTNER,
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(0)
      })
    );

    assertApproxEqRel(USER.balance, 1.08 ether, 0.05 ether);
    assertApproxEqRel(Mainnet.WETH.balanceOf(address(facet)), 0.008 ether, 0.05 ether);
  }

  function testFork_uniswapV2ExactInput_UsdcForDai() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, true);
    emit CollectedFee(address(0), address(Mainnet.DAI), 2 * 0, expectedFee);

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      })
    );

    assertEq(Mainnet.DAI.balanceOf(USER), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_DaiWethWbtc() public {
    address[] memory path = new address[](3);
    path[0] = address(Mainnet.DAI);
    path[1] = address(Mainnet.WETH);
    path[2] = address(Mainnet.WBTC);

    deal(address(Mainnet.DAI), USER, 2000 ether);

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1234;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.DAI.approve(address(facet), 2000 ether);

    // vm.expectEmit(true, true, true, true);
    // emit CollectedFee(address(0), address(Mainnet.DAI), 0, expectedFee);

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      })
    );

    assertEq(Mainnet.WBTC.balanceOf(USER), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_UsdcForEth() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(0);

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1086115131221856519;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, true);
    emit CollectedFee(address(0), address(Mainnet.WETH), 2 * 0, expectedFee);

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      })
    );

    assertEq(USER.balance, expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_EthForDai() public {
    address[] memory path = new address[](2);
    path[0] = address(0);
    path[1] = address(Mainnet.DAI);

    deal(USER, 1 ether);

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1828504762394564021029;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    vm.expectEmit(true, true, true, true);
    emit CollectedFee(address(0), address(Mainnet.DAI), 0, expectedFee);

    facet.uniswapV2ExactInput{value: 1 ether}(
      IUniV2Router.ExactInputParams({
        amountIn: 1 ether,
        amountOut: 1828504762394564021029,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      })
    );

    assertEq(Mainnet.DAI.balanceOf(USER), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_Recipient() public {
    address recipient = makeAddr('recipient');

    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, true);
    emit CollectedFee(address(0), address(Mainnet.DAI), 2 * 0, expectedFee);

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: recipient,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      })
    );

    assertEq(Mainnet.DAI.balanceOf(recipient), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_revertInsufficientOutputAmount() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectRevert(abi.encodeWithSelector(Errors.InsufficientOutputAmount.selector));

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut + 1,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      })
    );
  }

  function testFork_uniswapV2ExactInput_revertDeadlineExpired() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectRevert(abi.encodeWithSelector(Errors.DeadlineExpired.selector));

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut + 1,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(block.timestamp - 1),
        partner: address(0),
        path: path
      })
    );
  }

  function testFork_uniswapV2ExactInputSingle_EthForDai() public {
    deal(USER, 1 ether);

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1828504762394564021029;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    vm.expectEmit(true, true, true, true);
    emit CollectedFee(address(0), address(Mainnet.DAI), 0, expectedFee);

    facet.uniswapV2ExactInputSingle{value: 1 ether}(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1828504762394564021029,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.DAI)
      })
    );

    assertEq(Mainnet.DAI.balanceOf(USER), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInputSingle_revertDeadlineExpired() public {
    vm.expectRevert(abi.encodeWithSelector(Errors.DeadlineExpired.selector));

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 1,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(block.timestamp - 1),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      })
    );
  }

  function testFork_uniswapV2ExactInputSingle_revertInsufficientOutputAmount() public {
    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectRevert(abi.encodeWithSelector(Errors.InsufficientOutputAmount.selector));

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut + 1,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      })
    );
  }

  function testFork_uniswapV2ExactInputSingle_recipient() public {
    address recipient = makeAddr('recipient');

    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, true);
    emit CollectedFee(address(0), address(Mainnet.DAI), 2 * 0, expectedFee);

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: recipient,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      })
    );

    assertEq(Mainnet.DAI.balanceOf(recipient), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForEth() public {
    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1086115131221856519;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, true);
    emit CollectedFee(address(0), address(Mainnet.WETH), 2 * 0, expectedFee);

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(0)
      })
    );

    assertEq(USER.balance, expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForDai() public {
    deal(address(Mainnet.USDC), USER, 2000 * (10 ** 6));

    vm.startPrank(USER);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(facet), 2000 * (10 ** 6));

    vm.expectEmit(true, true, true, true);
    emit CollectedFee(address(0), address(Mainnet.DAI), 2 * 0, expectedFee);

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: USER,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      })
    );

    assertEq(Mainnet.DAI.balanceOf(USER), expectedSwapOut - expectedFee);
  }

  receive() external payable {}
}
