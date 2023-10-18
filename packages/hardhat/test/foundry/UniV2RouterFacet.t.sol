// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Addresses, Mainnet} from './helpers/Networks.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IUniV2Router} from 'contracts/interfaces/IUniV2Router.sol';
import {ILibStarVault} from 'contracts/interfaces/ILibStarVault.sol';
import {UniV2RouterFacet} from 'contracts/facets/UniV2RouterFacet.sol';
import {InitUniV2Router} from 'contracts/init/InitUniV2Router.sol';
import {IPermit2} from 'contracts/interfaces/external/IPermit2.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {PermitSignature} from './helpers/PermitSignature.sol';

contract UniV2RouterFacetTestBase is FacetTest, ILibStarVault {
  IUniV2Router internal facet;

  function setUpOn(uint256 chainId, uint256 blockNumber) internal override {
    super.setUpOn(chainId, blockNumber);

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
        Mainnet.UNISWAP_V2_FACTORY_ADDR,
        Addresses.PERMIT2
      )
    );

    facet = IUniV2Router(address(diamond));
  }
}

/**
 * @notice assertApproxRelEq is used in this test with a tolerance of 0.05 ether which equals to 5%
 */

contract UniV2RouterFacetTest is UniV2RouterFacetTestBase {
  function setUp() public override {
    super.setUpOn(1, 17853419);
  }

  function testFork_uniswapV2ExactInputSingle_EthForUsdc_PositiveSlippage() public {
    deal(user, 1 ether);

    vm.prank(user);
    facet.uniswapV2ExactInputSingle{value: 1 ether}(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1830 * (10 ** 6),
        recipient: user,
        slippage: 50,
        feeBps: 0,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC)
      }),
      emptyPermitParams
    );

    assertApproxEqRel(Mainnet.USDC.balanceOf(user), 1830 * (10 ** 6), 0.05 ether);
    assertApproxEqRel(Mainnet.USDC.balanceOf(address(facet)), 160_000, 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_EthForUsdc_CollectFees() public {
    deal(user, 1 ether);

    vm.expectEmit(true, true, true, false);
    emit Fee(partner, address(Mainnet.USDC), 1.83 * (10 ** 6), 1.83 * (10 ** 6));

    vm.prank(user);
    facet.uniswapV2ExactInputSingle{value: 1 ether}(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1835 * (10 ** 6),
        recipient: user,
        slippage: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: partner,
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC)
      }),
      emptyPermitParams
    );

    assertApproxEqRel(Mainnet.USDC.balanceOf(user), 1830 * (10 ** 6), 0.05 ether);
    assertApproxEqRel(Mainnet.USDC.balanceOf(address(facet)), 3.5 * (10 ** 6), 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForDai_SwapsOnePool() public {
    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 2000 * (10 ** 18),
        recipient: user,
        slippage: 50,
        feeBps: 0,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertApproxEqRel(Mainnet.DAI.balanceOf(user), 2000 * (10 ** 18), 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForDai_CollectFees() public {
    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectEmit(true, true, true, false);
    emit Fee(partner, address(Mainnet.DAI), 2 * (10 ** 18), 2 * (10 ** 18));

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 2000 * (10 ** 18),
        recipient: user,
        slippage: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: partner,
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertApproxEqRel(Mainnet.DAI.balanceOf(user), 2000 * (10 ** 18), 0.05 ether);
    assertApproxEqRel(Mainnet.DAI.balanceOf(address(facet)), 4 * (10 ** 18), 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForEth_PositiveSlippage() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(0);

    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 1.08 ether,
        recipient: user,
        slippage: 50,
        feeBps: 0,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(0)
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertApproxEqRel(user.balance, 1.08 ether, 0.05 ether);
    assertApproxEqRel(Mainnet.WETH.balanceOf(address(facet)), 0.006 ether, 0.05 ether);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForEth_CollectFees() public {
    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectEmit(true, true, true, false);
    emit Fee(partner, address(Mainnet.WETH), 0.004 ether, 0.004 ether);

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 1.08 ether,
        recipient: user,
        slippage: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: partner,
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(0)
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertApproxEqRel(user.balance, 1.08 ether, 0.05 ether);
    assertApproxEqRel(Mainnet.WETH.balanceOf(address(facet)), 0.008 ether, 0.05 ether);
  }

  function testFork_uniswapV2ExactInput_UsdcForDai() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.DAI), 2 * 0, expectedFee);

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(Mainnet.DAI.balanceOf(user), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_DaiWethWbtc() public {
    address[] memory path = new address[](3);
    path[0] = address(Mainnet.DAI);
    path[1] = address(Mainnet.WETH);
    path[2] = address(Mainnet.WBTC);

    deal(address(Mainnet.DAI), user, 2000 ether);

    vm.startPrank(user);

    uint256 expectedSwapOut = 1234;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.DAI.approve(address(Addresses.PERMIT2), 2000 ether);

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.DAI),
        amount: 2000 ether,
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    // vm.expectEmit(true, true, true, true);
    // emit Fee(address(0), address(Mainnet.DAI), 0, expectedFee);

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(Mainnet.WBTC.balanceOf(user), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_UsdcForEth() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(0);

    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    uint256 expectedSwapOut = 1086115131221856519;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.WETH), 2 * 0, expectedFee);

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(user.balance, expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_EthForDai() public {
    address[] memory path = new address[](2);
    path[0] = address(0);
    path[1] = address(Mainnet.DAI);

    deal(user, 1 ether);

    vm.startPrank(user);

    uint256 expectedSwapOut = 1828504762394564021029;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.DAI), 0, expectedFee);

    facet.uniswapV2ExactInput{value: 1 ether}(
      IUniV2Router.ExactInputParams({
        amountIn: 1 ether,
        amountOut: 1828504762394564021029,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      }),
      emptyPermitParams
    );

    assertEq(Mainnet.DAI.balanceOf(user), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_Recipient() public {
    address recipient = makeAddr('recipient');

    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.DAI), 2 * 0, expectedFee);

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
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(Mainnet.DAI.balanceOf(recipient), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInput_revertInsufficientOutputAmount() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    uint256 expectedSwapOut = 1991846446632959177237;

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectRevert(abi.encodeWithSelector(IUniV2Router.InsufficientOutputAmount.selector));

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut + 1,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        path: path
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );
  }

  function testFork_uniswapV2ExactInput_revertDeadlineExpired() public {
    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    uint256 expectedSwapOut = 1991846446632959177237;

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectRevert(abi.encodeWithSelector(IUniV2Router.DeadlineExpired.selector));

    facet.uniswapV2ExactInput(
      IUniV2Router.ExactInputParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut + 1,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(block.timestamp - 1),
        partner: address(0),
        path: path
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );
  }

  function testFork_uniswapV2ExactInputSingle_EthForDai() public {
    deal(user, 1 ether);

    vm.startPrank(user);

    uint256 expectedSwapOut = 1828504762394564021029;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.DAI), 0, expectedFee);

    facet.uniswapV2ExactInputSingle{value: 1 ether}(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1828504762394564021029,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.DAI)
      }),
      emptyPermitParams
    );

    assertEq(Mainnet.DAI.balanceOf(user), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInputSingle_revertDeadlineExpired() public {
    vm.expectRevert(abi.encodeWithSelector(IUniV2Router.DeadlineExpired.selector));

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: 1,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(block.timestamp - 1),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      }),
      emptyPermitParams
    );
  }

  function testFork_uniswapV2ExactInputSingle_revertInsufficientOutputAmount() public {
    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    uint256 expectedSwapOut = 1991846446632959177237;

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));
    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectRevert(abi.encodeWithSelector(IUniV2Router.InsufficientOutputAmount.selector));

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut + 1,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );
  }

  function testFork_uniswapV2ExactInputSingle_recipient() public {
    address recipient = makeAddr('recipient');

    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.DAI), 2 * 0, expectedFee);

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
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(Mainnet.DAI.balanceOf(recipient), expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForEth() public {
    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    uint256 expectedSwapOut = 1086115131221856519;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));
    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.WETH), 2 * 0, expectedFee);

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(0)
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(user.balance, expectedSwapOut - expectedFee);
  }

  function testFork_uniswapV2ExactInputSingle_UsdcForDai() public {
    deal(address(Mainnet.USDC), user, 2000 * (10 ** 6));

    vm.startPrank(user);

    uint256 expectedSwapOut = 1991846446632959177237;
    uint256 expectedFee = (expectedSwapOut * 10) / 10_000;

    Mainnet.USDC.approve(address(Addresses.PERMIT2), 2000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 2000 * (10 ** 6),
        expiration: (uint48)(deadline),
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.expectEmit(true, true, true, true);
    emit Fee(address(0), address(Mainnet.DAI), 2 * 0, expectedFee);

    facet.uniswapV2ExactInputSingle(
      IUniV2Router.ExactInputSingleParams({
        amountIn: 2000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: user,
        slippage: 0,
        feeBps: 10,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI)
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(Mainnet.DAI.balanceOf(user), expectedSwapOut - expectedFee);
  }

  receive() external payable {}
}
