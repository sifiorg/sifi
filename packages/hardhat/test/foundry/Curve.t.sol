// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Addresses, Mainnet} from './helpers/Networks.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {ICurve} from 'contracts/interfaces/ICurve.sol';
import {ILibStarVault} from 'contracts/interfaces/ILibStarVault.sol';
import {Curve} from 'contracts/facets/Curve.sol';
import {InitLibWarp} from 'contracts/init/InitLibWarp.sol';
import {LibWarp} from 'contracts/libraries/LibWarp.sol';
import {IUniswapV2Factory} from 'contracts/interfaces/external/IUniswapV2Factory.sol';
import {IPermit2} from 'contracts/interfaces/external/IPermit2.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {PermitSignature} from './helpers/PermitSignature.sol';
import {CurveHelpers} from './helpers/CurveHelpers.sol';

contract CurveTest is FacetTest, CurveHelpers, ILibStarVault {
  ICurve internal facet;

  function setUp() public override {
    setUpOn(Mainnet.CHAIN_ID, 17853419);

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);

    facetCuts[0] = IDiamondCut.FacetCut(
      address(new Curve()),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('Curve')
    );

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(new InitLibWarp()),
      abi.encodeWithSelector(
        InitLibWarp.init.selector,
        Addresses.weth(1),
        Addresses.PERMIT2,
        Addresses.stargateComposer(1)
      )
    );

    facet = ICurve(address(diamond));
  }

  function testFork_curveExactInputSingle_EthToSteth() public {
    deal(user, 1 ether);

    uint8 kind = 2;

    address pool = 0xDC24316b9AE028F1497c275EB9192a3Ea0f67022;
    uint8 i = getIndex(kind, pool, address(0));
    uint8 j = getIndex(kind, pool, address(Mainnet.STETH));

    vm.expectEmit(true, true, true, true);
    emit LibWarp.Warp(address(0), address(0), address(Mainnet.STETH), 1 ether, 1000226977976805063);

    vm.prank(user);
    facet.curveExactInputSingle{value: 1 ether}(
      ICurve.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1000226977976805063,
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.STETH),
        pool: pool,
        tokenIndexIn: i,
        tokenIndexOut: j,
        kind: kind,
        underlying: false
      })
    );

    assertApproxEqRel(Mainnet.STETH.balanceOf(user), 1000226977976805063, 0.001 ether);
  }

  function testFork_curveExactInputSinglePermit_StethToEth() public {
    uint8 kind = 2;

    // NOTE: deal doesn't work for this token, borrow some coins from a whale istead
    vm.prank(0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0);
    Mainnet.STETH.transfer(user, 1 ether);

    // v0.2.8 Stableswap
    address pool = 0xDC24316b9AE028F1497c275EB9192a3Ea0f67022;
    uint8 i = getIndex(kind, pool, address(Mainnet.STETH));
    uint8 j = getIndex(kind, pool, address(0));

    vm.prank(user);
    Mainnet.STETH.approve(address(Addresses.PERMIT2), 1 ether);

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.STETH),
        amount: 1 ether,
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.curveExactInputSinglePermit(
      ICurve.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1 ether,
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.STETH),
        tokenOut: address(0),
        pool: pool,
        tokenIndexIn: i,
        tokenIndexOut: j,
        kind: kind,
        underlying: false
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertApproxEqRel(user.balance, 1 ether, 0.01 ether);
  }

  function testFork_curveExactInputSinglePermit_DaiToUsdc() public {
    uint8 kind = 1;

    deal(address(Mainnet.DAI), user, 1000 ether);

    address pool = 0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7;
    uint8 i = getIndex(kind, pool, address(Mainnet.DAI));
    uint8 j = getIndex(kind, pool, address(Mainnet.USDC));

    vm.prank(user);
    Mainnet.DAI.approve(address(Addresses.PERMIT2), 1000 ether);

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.DAI),
        amount: 1000 ether,
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.curveExactInputSinglePermit(
      ICurve.ExactInputSingleParams({
        amountIn: 1000 ether,
        amountOut: 1000 * (10 ** 6),
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.DAI),
        tokenOut: address(Mainnet.USDC),
        pool: pool,
        tokenIndexIn: i,
        tokenIndexOut: j,
        kind: kind,
        underlying: false
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertApproxEqRel(Mainnet.USDC.balanceOf(user), 1000 * (10 ** 6), 0.01 ether);
  }

  function testFork_curveExactInputSinglePermit_DaiToGusd() public {
    uint8 kind = 1;

    deal(address(Mainnet.DAI), user, 1000 ether);

    address pool = 0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956;
    uint8 i = getUnderlyingIndex(kind, pool, address(Mainnet.DAI));
    uint8 j = getIndex(kind, pool, address(Mainnet.GUSD));

    vm.prank(user);
    Mainnet.DAI.approve(address(Addresses.PERMIT2), 1000 ether);

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.DAI),
        amount: 1000 ether,
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.curveExactInputSinglePermit(
      ICurve.ExactInputSingleParams({
        amountIn: 1000 ether,
        amountOut: 1000 * (10 ** 2),
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.DAI),
        tokenOut: address(Mainnet.GUSD),
        pool: pool,
        tokenIndexIn: i,
        tokenIndexOut: j,
        kind: kind,
        underlying: true
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertApproxEqRel(Mainnet.GUSD.balanceOf(user), 1000 * (10 ** 2), 0.01 ether);
  }

  function testFork_curveExactInputSinglePermit_GusdToDai() public {
    uint8 kind = 1;

    // NOTE: deal doesn't work for this token, borrow some coins from a whale istead
    vm.prank(0x79A0FA989fb7ADf1F8e80C93ee605Ebb94F7c6A5);
    Mainnet.GUSD.transfer(user, 1000 * (10 ** 2));

    address pool = 0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956;
    uint8 i = getIndex(kind, pool, address(Mainnet.GUSD));
    uint8 j = getUnderlyingIndex(kind, pool, address(Mainnet.DAI));

    vm.prank(user);
    Mainnet.GUSD.approve(address(Addresses.PERMIT2), 1000 * (10 ** 2));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.GUSD),
        amount: 1000 * (10 ** 2),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.curveExactInputSinglePermit(
      ICurve.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 2),
        amountOut: 1000 ether,
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.GUSD),
        tokenOut: address(Mainnet.DAI),
        pool: pool,
        tokenIndexIn: i,
        tokenIndexOut: j,
        kind: kind,
        underlying: true
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertApproxEqRel(Mainnet.DAI.balanceOf(user), 1000 ether, 0.01 ether);
  }

  function testFork_curveExactInputSingle_CurveTricryptoOptimizedWETH_useEth_from() public {
    uint8 kind = 3;

    address pool = 0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B;
    uint8 i = getIndex(kind, pool, address(Mainnet.WETH));
    uint8 j = getIndex(kind, pool, address(Mainnet.WBTC));

    deal(user, 1 ether);

    vm.prank(user);
    facet.curveExactInputSingle{value: 1 ether}(
      ICurve.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 6315168,
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.WBTC),
        pool: pool,
        tokenIndexIn: i,
        tokenIndexOut: j,
        kind: kind,
        underlying: false
      })
    );

    assertEq(Mainnet.WBTC.balanceOf(user), 6315168);
  }

  function testFork_curveExactInputSinglePermit_CurveTricryptoOptimizedWETH_useEth_to() public {
    uint8 kind = 3;
    uint256 amountIn = 0.01 * (10 ** 8);

    address pool = 0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B;
    uint8 i = getIndex(kind, pool, address(Mainnet.WBTC));
    uint8 j = getIndex(kind, pool, address(Mainnet.WETH));

    deal(address(Mainnet.WBTC), user, amountIn);

    vm.prank(user);
    Mainnet.WBTC.approve(address(Addresses.PERMIT2), amountIn);

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.WBTC),
        amount: uint160(amountIn),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.curveExactInputSinglePermit(
      ICurve.ExactInputSingleParams({
        amountIn: amountIn,
        amountOut: 6315168,
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.WBTC),
        tokenOut: address(0),
        pool: pool,
        tokenIndexIn: i,
        tokenIndexOut: j,
        kind: kind,
        underlying: false
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(user.balance, 6315168);
  }

  function testFork_curveExactInputSingle_StethToEth() public {
    uint8 kind = 2;

    // NOTE: deal doesn't work for this token, borrow some coins from a whale istead
    vm.prank(0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0);
    Mainnet.STETH.transfer(user, 1 ether);

    // v0.2.8 Stableswap
    address pool = 0xDC24316b9AE028F1497c275EB9192a3Ea0f67022;
    uint8 i = getIndex(kind, pool, address(Mainnet.STETH));
    uint8 j = getIndex(kind, pool, address(0));

    vm.prank(user);
    Mainnet.STETH.approve(address(diamond), 1 ether);

    vm.prank(user);
    facet.curveExactInputSingle(
      ICurve.ExactInputSingleParams({
        amountIn: 1 ether,
        amountOut: 1 ether,
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.STETH),
        tokenOut: address(0),
        pool: pool,
        tokenIndexIn: i,
        tokenIndexOut: j,
        kind: kind,
        underlying: false
      })
    );

    assertApproxEqRel(user.balance, 1 ether, 0.01 ether);
  }

  receive() external payable {}
}
