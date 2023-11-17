// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {IWETH} from '@uniswap/v2-periphery/contracts/interfaces/IWETH.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IUniswapV2Router01} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IEnergyShield} from 'contracts/interfaces/IEnergyShield.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IStateless} from 'contracts/interfaces/IStateless.sol';
import {Stateless} from 'contracts/facets/Stateless.sol';
import {InitLibWarp} from 'contracts/init/InitLibWarp.sol';
import {IWooPPV2} from 'contracts/interfaces/external/IWooPPV2.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Addresses, Mainnet, Optimism} from './helpers/Networks.sol';

contract StatelessTestBase is FacetTest {
  IStateless internal facet;

  function setUpOn(uint256 chainId, uint256 blockNumber) internal override {
    super.setUpOn(chainId, blockNumber);

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);

    facet = new Stateless();

    facetCuts[0] = IDiamondCut.FacetCut(
      address(facet),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('Stateless')
    );

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(new InitLibWarp()),
      abi.encodeWithSelector(
        InitLibWarp.init.selector,
        Addresses.weth(chainId),
        Addresses.PERMIT2,
        Addresses.stargateComposer(chainId)
      )
    );

    facet = IStateless(address(diamond));
  }
}

contract StatelessMainnetTest is StatelessTestBase {
  using SafeERC20 for IERC20;

  function setUp() public override {
    super.setUpOn(Mainnet.CHAIN_ID, 17853419);
  }

  function testFork_energyShield_drain() public {
    address energyShieldAddress = facet.energyShieldAddress();

    vm.deal(energyShieldAddress, 1 ether);
    deal(address(Mainnet.USDC), energyShieldAddress, 1000 * (10 ** 6));

    vm.prank(address(diamond));
    IEnergyShield(energyShieldAddress).drain(address(Mainnet.USDC));

    assertEq(Mainnet.USDC.balanceOf(energyShieldAddress), 0);
    assertEq(Mainnet.USDC.balanceOf(address(diamond)), 1000 * (10 ** 6));

    vm.prank(address(diamond));
    IEnergyShield(energyShieldAddress).drain(address(0));

    assertEq(address(energyShieldAddress).balance, 0);
    assertEq(address(diamond).balance, 1 ether);
  }

  function testFork_multi_univ2Router_usdcForDai() public {
    uint256 amountIn = 2000 * (10 ** 6);

    deal(address(Mainnet.USDC), user, amountIn);

    vm.prank(user);
    Mainnet.USDC.approve(address(diamond), amountIn);

    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    address energyShieldAddress = facet.energyShieldAddress();

    bytes memory dataApprove = abi.encodeWithSelector(
      IERC20.approve.selector,
      address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D),
      amountIn
    );

    bytes memory dataSwap = abi.encodeWithSelector(
      IUniswapV2Router01.swapExactTokensForTokens.selector,
      amountIn,
      1,
      path,
      energyShieldAddress,
      uint256(deadline)
    );

    bytes memory data = bytes.concat(dataApprove, dataSwap);

    uint256[] memory offsets = new uint256[](1);
    offsets[0] = dataApprove.length;

    address[] memory targets = new address[](2);
    targets[0] = address(Mainnet.USDC);
    targets[1] = address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

    vm.prank(user);
    facet.warpStatelessMulti(
      IStateless.MultiParams({
        amountIn: amountIn,
        amountOut: 1991846446632959177237,
        recipient: user,
        slippageBps: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI),
        targets: targets,
        data: data,
        offsets: offsets,
        push: false,
        delivers: false
      })
    );

    assertEq(Mainnet.DAI.balanceOf(user), 1991846446632959177237 - 3983692893265918354);
  }

  function testFork_multiPermit_univ2Router_usdcForDai() public {
    uint256 amountIn = 2000 * (10 ** 6);

    deal(address(Mainnet.USDC), user, amountIn);

    vm.prank(user);
    Mainnet.USDC.forceApprove(address(Addresses.PERMIT2), amountIn);

    address[] memory path = new address[](2);
    path[0] = address(Mainnet.USDC);
    path[1] = address(Mainnet.DAI);

    address energyShieldAddress = facet.energyShieldAddress();

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: (uint160)(amountIn),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    bytes memory dataApprove = abi.encodeWithSelector(
      IERC20.approve.selector,
      address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D),
      amountIn
    );

    bytes memory dataSwap = abi.encodeWithSelector(
      IUniswapV2Router01.swapExactTokensForTokens.selector,
      amountIn,
      1,
      path,
      energyShieldAddress,
      uint256(deadline)
    );

    bytes memory data = bytes.concat(dataApprove, dataSwap);

    uint256[] memory offsets = new uint256[](1);
    offsets[0] = dataApprove.length;

    address[] memory targets = new address[](2);
    targets[0] = address(Mainnet.USDC);
    targets[1] = address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

    vm.prank(user);
    facet.warpStatelessMultiPermit(
      IStateless.MultiParams({
        amountIn: amountIn,
        amountOut: 1991846446632959177237,
        recipient: user,
        slippageBps: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.DAI),
        targets: targets,
        data: data,
        offsets: offsets,
        push: false,
        delivers: false
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(Mainnet.DAI.balanceOf(user), 1991846446632959177237 - 3983692893265918354);
  }
}

contract StatelessOptimismTest is StatelessTestBase {
  using SafeERC20 for IERC20;

  function setUp() public override {
    super.setUpOn(Optimism.CHAIN_ID, 109754831);
  }

  function testFork_single_woofi_usdtToWbtc() public {
    uint256 amountIn = 2000 * (10 ** 6);

    deal(address(Optimism.USDT), user, amountIn);

    vm.prank(user);
    Optimism.USDT.approve(address(diamond), amountIn);

    vm.prank(user);
    facet.warpStatelessSingle(
      IStateless.SingleParams({
        amountIn: amountIn,
        amountOut: 7448015,
        recipient: user,
        slippageBps: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Optimism.USDT),
        tokenOut: address(Optimism.WBTC),
        target: 0xd1778F9DF3eee5473A9640f13682e3846f61fEbC,
        data: abi.encodeWithSelector(
          IWooPPV2.swap.selector,
          address(Optimism.USDT),
          address(Optimism.WBTC),
          amountIn,
          1,
          // NOTE: Tokens are delivered by WooPPV2 to the diamond, skipping the energy shield
          address(diamond),
          address(0)
        ),
        push: true,
        delivers: true
      })
    );

    assertEq(Optimism.WBTC.balanceOf(user), 7448015 - 14896);
  }

  function testFork_singlePermit_woofi_usdtToWbtc() public {
    uint256 amountIn = 2000 * (10 ** 6);

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Optimism.USDT),
        amount: (uint160)(amountIn),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    deal(address(Optimism.USDT), user, amountIn);

    vm.prank(user);
    Optimism.USDT.forceApprove(address(Addresses.PERMIT2), amountIn);

    vm.prank(user);
    facet.warpStatelessSinglePermit(
      IStateless.SingleParams({
        amountIn: amountIn,
        amountOut: 7448015,
        recipient: user,
        slippageBps: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(Optimism.USDT),
        tokenOut: address(Optimism.WBTC),
        target: 0xd1778F9DF3eee5473A9640f13682e3846f61fEbC,
        data: abi.encodeWithSelector(
          IWooPPV2.swap.selector,
          address(Optimism.USDT),
          address(Optimism.WBTC),
          amountIn,
          1,
          // NOTE: Tokens are delivered by WooPPV2 to the diamond, skipping the energy shield
          address(diamond),
          address(0)
        ),
        push: true,
        delivers: true
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(Optimism.WBTC.balanceOf(user), 7448015 - 14896);
  }

  function testFork_single_ethWrap() public {
    uint256 amountIn = 1 ether;

    vm.deal(user, amountIn);

    vm.prank(user);
    facet.warpStatelessSingle{value: amountIn}(
      IStateless.SingleParams({
        amountIn: amountIn,
        amountOut: 1 ether,
        recipient: user,
        slippageBps: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Optimism.WETH),
        target: address(Optimism.WETH),
        data: abi.encodeWithSelector(IWETH.deposit.selector),
        push: false,
        delivers: false
      })
    );

    assertEq(Optimism.WETH.balanceOf(user), 0.998 ether);
  }

  /**
   * Wrap 1 ether, send it to WooPPV2, and swap it for WBTC
   */
  function testFork_multi_woofi_ethToWbtc() public {
    uint256 amountIn = 1 ether;

    bytes memory dataWrap = abi.encodeWithSelector(IWETH.deposit.selector);

    bytes memory dataTransfer = abi.encodeWithSelector(
      IERC20.transfer.selector,
      address(0xd1778F9DF3eee5473A9640f13682e3846f61fEbC),
      amountIn
    );

    bytes memory dataSwap = abi.encodeWithSelector(
      IWooPPV2.swap.selector,
      address(Optimism.WETH),
      address(Optimism.WBTC),
      amountIn,
      1,
      // NOTE: Tokens are delivered by WooPPV2 to the diamond, skipping the energy shield
      address(diamond),
      address(0)
    );

    uint256[] memory offsets = new uint256[](2);
    offsets[0] = dataWrap.length;
    offsets[1] = offsets[0] + dataTransfer.length;

    address[] memory targets = new address[](3);
    targets[0] = address(Optimism.WETH);
    targets[1] = address(Optimism.WETH);
    targets[2] = address(0xd1778F9DF3eee5473A9640f13682e3846f61fEbC);

    vm.deal(user, amountIn);

    vm.prank(user);
    facet.warpStatelessMulti{value: amountIn}(
      IStateless.MultiParams({
        amountIn: amountIn,
        amountOut: 6098244,
        recipient: user,
        slippageBps: 50,
        feeBps: 20,
        deadline: (uint48)(deadline),
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Optimism.WBTC),
        targets: targets,
        data: bytes.concat(dataWrap, dataTransfer, dataSwap),
        offsets: offsets,
        push: false,
        delivers: true
      })
    );

    assertEq(Optimism.WBTC.balanceOf(user), 6086048);
  }
}
