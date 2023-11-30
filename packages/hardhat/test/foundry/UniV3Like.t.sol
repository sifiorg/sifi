// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Addresses, Mainnet, Polygon} from './helpers/Networks.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IUniV3Like} from 'contracts/interfaces/IUniV3Like.sol';
import {ILibStarVault} from 'contracts/interfaces/ILibStarVault.sol';
import {UniV3Like} from 'contracts/facets/UniV3Like.sol';
import {InitLibWarp} from 'contracts/init/InitLibWarp.sol';
import {UniV3Callback} from 'contracts/facets/UniV3Callback.sol';
import {IPermit2} from 'contracts/interfaces/external/IPermit2.sol';
import {ISignatureTransfer} from 'contracts/interfaces/external/ISignatureTransfer.sol';
import {PermitSignature} from './helpers/PermitSignature.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';

abstract contract UniV3LikeTestBase is FacetTest {
  IUniV3Like internal facet;

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
      abi.encodeWithSelector(
        InitLibWarp.init.selector,
        Addresses.weth(chainId),
        Addresses.PERMIT2,
        Addresses.stargateComposer(chainId)
      )
    );

    facet = IUniV3Like(address(diamond));
  }
}

contract UniV3LikeMainnetTest is UniV3LikeTestBase {
  function setUp() public override {
    setUpOn(Mainnet.CHAIN_ID, 17853419);
  }

  function testFork_uniswapV3LikeExactInputSingle_UsdcToUsdt() public {
    deal(address(Mainnet.USDC), user, 1000 * (10 ** 6));

    address pool = 0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf;

    vm.prank(user);
    Mainnet.USDC.approve(address(diamond), 1000 * (10 ** 6));

    vm.prank(user);
    facet.uniswapV3LikeExactInputSingle(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 6),
        amountOut: 999 * (10 ** 6),
        recipient: user,
        slippageBps: 50,
        feeBps: 10,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.USDT),
        pool: pool
      })
    );

    uint256 expectedOutBeforeFee = 999 * (10 ** 6);
    uint256 expectedFee = (expectedOutBeforeFee * 10) / 10_000;
    uint256 expectedOut = expectedOutBeforeFee - expectedFee;

    assertEq(Mainnet.USDT.balanceOf(user), expectedOut);
  }

  function testFork_uniswapV3LikeExactInputSinglePermit_UsdcToUsdt() public {
    deal(address(Mainnet.USDC), user, 1000 * (10 ** 6));

    address pool = 0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf;

    vm.prank(user);
    Mainnet.USDC.approve(address(Addresses.PERMIT2), 1000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 1000 * (10 ** 6),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.uniswapV3LikeExactInputSinglePermit(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 6),
        amountOut: 999 * (10 ** 6),
        recipient: user,
        slippageBps: 50,
        feeBps: 10,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.USDT),
        pool: pool
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    uint256 expectedOutBeforeFee = 999 * (10 ** 6);
    uint256 expectedFee = (expectedOutBeforeFee * 10) / 10_000;
    uint256 expectedOut = expectedOutBeforeFee - expectedFee;

    assertEq(Mainnet.USDT.balanceOf(user), expectedOut);
  }

  function testFork_uniswapV3LikeExactInputSingle_UsdcToEth() public {
    deal(address(Mainnet.USDC), user, 1000 * (10 ** 6));

    // USDC/WETH, 0.3%
    address pool = 0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8;

    vm.prank(user);
    Mainnet.USDC.approve(address(diamond), 1000 * (10 ** 6));

    vm.prank(user);
    facet.uniswapV3LikeExactInputSingle(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 6),
        amountOut: 544318039549018921,
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(0),
        pool: pool
      })
    );

    assertEq(user.balance, 544318039549018921);
  }

  function testFork_uniswapV3LikeExactInputSinglePermit_UsdcToEth() public {
    deal(address(Mainnet.USDC), user, 1000 * (10 ** 6));

    // USDC/WETH, 0.3%
    address pool = 0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8;

    vm.prank(user);
    Mainnet.USDC.approve(address(Addresses.PERMIT2), 1000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 1000 * (10 ** 6),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.uniswapV3LikeExactInputSinglePermit(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 6),
        amountOut: 544318039549018921,
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(0),
        pool: pool
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(user.balance, 544318039549018921);
  }

  function testFork_uniswapV3LikeExactInputSingle_EthToUsdc() public {
    vm.deal(user, 2 ether);

    // USDC/WETH, 0.3%
    address pool = 0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8;

    vm.prank(user);
    facet.uniswapV3LikeExactInputSingle{value: 2 ether}(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 2 ether,
        amountOut: 3652264740,
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC),
        pool: pool
      })
    );

    assertEq(Mainnet.USDC.balanceOf(user), 3652264740);
  }

  function testFork_uniswapV3LikeExactInput_UsdcUsdtEth() public {
    uint256 amountIn = 1000 * (10 ** 6);

    deal(address(Mainnet.USDC), user, amountIn);

    address[] memory tokens = new address[](3);
    tokens[0] = address(Mainnet.USDC);
    tokens[1] = address(Mainnet.USDT);
    tokens[2] = address(0);

    address[] memory pools = new address[](2);
    pools[0] = 0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf;
    pools[1] = 0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36;

    uint256 amountOut = 544005533891390927;

    vm.prank(user);
    Mainnet.USDC.approve(address(diamond), amountIn);

    vm.prank(user);
    facet.uniswapV3LikeExactInput(
      IUniV3Like.ExactInputParams({
        amountIn: amountIn,
        amountOut: amountOut,
        recipient: user,
        slippageBps: 0,
        feeBps: 10,
        deadline: deadline,
        partner: address(0),
        tokens: tokens,
        pools: pools
      })
    );

    assertEq(user.balance, amountOut - (amountOut * 10) / 10_000);
  }

  function testFork_uniswapV3LikeExactInputPermit_UsdcUsdtEth() public {
    uint256 amountIn = 1000 * (10 ** 6);

    deal(address(Mainnet.USDC), user, amountIn);

    address[] memory tokens = new address[](3);
    tokens[0] = address(Mainnet.USDC);
    tokens[1] = address(Mainnet.USDT);
    tokens[2] = address(0);

    address[] memory pools = new address[](2);
    pools[0] = 0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf;
    pools[1] = 0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36;

    uint256 amountOut = 544005533891390927;

    vm.prank(user);
    Mainnet.USDC.approve(address(Addresses.PERMIT2), amountIn);

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

    vm.prank(user);
    facet.uniswapV3LikeExactInputPermit(
      IUniV3Like.ExactInputParams({
        amountIn: amountIn,
        amountOut: amountOut,
        recipient: user,
        slippageBps: 0,
        feeBps: 10,
        deadline: deadline,
        partner: address(0),
        tokens: tokens,
        pools: pools
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(user.balance, amountOut - (amountOut * 10) / 10_000);
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

    deal(address(tokenIn), user, 1000 * (10 ** 6));

    vm.prank(user);
    IERC20(tokenIn).approve(address(diamond), 1000 * (10 ** 6));

    vm.prank(user);
    facet.uniswapV3LikeExactInputSingle(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 6),
        amountOut: 999 * (10 ** 6),
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        pool: pool
      })
    );

    assertEq(IERC20(tokenOut).balanceOf(user), 999 * (10 ** 6));
  }

  function testFork_uniswapV3LikeExactInputSinglePermit_QuickswapV3UsdcToUsdt() public {
    address pool = 0x7B925e617aefd7FB3a93Abe3a701135D7a1Ba710;
    address tokenIn = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address tokenOut = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;

    deal(address(tokenIn), user, 1000 * (10 ** 6));

    vm.prank(user);
    IERC20(tokenIn).approve(address(Addresses.PERMIT2), 1000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: tokenIn,
        amount: 1000 * (10 ** 6),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.uniswapV3LikeExactInputSinglePermit(
      IUniV3Like.ExactInputSingleParams({
        amountIn: 1000 * (10 ** 6),
        amountOut: 999 * (10 ** 6),
        recipient: user,
        slippageBps: 50,
        feeBps: 0,
        deadline: deadline,
        partner: address(0),
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        pool: pool
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(IERC20(tokenOut).balanceOf(user), 999 * (10 ** 6));
  }
}
