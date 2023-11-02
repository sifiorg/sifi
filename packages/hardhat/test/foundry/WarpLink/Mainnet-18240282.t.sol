// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {LibWarp} from 'contracts/libraries/LibWarp.sol';
import {IStargateRouter} from 'contracts/interfaces/external/IStargateRouter.sol';
import {Addresses, Mainnet} from '../helpers/Networks.sol';
import {WarpLinkTestBase} from './TestBase.sol';
import {IStargateComposer} from '../helpers/IStargateComposer.sol';

// Block on 2023-09-29
// Stargate switched to requiring the composer
contract WarpLinkMainnet18240282Test is WarpLinkTestBase {
  function setUp() public override {
    setUpOn(1, 18240282);
  }

  function testFork_warpLinkEngage_jumpStargate_EthToUsdc() public {
    uint256 amountIn = 1 ether;

    bytes memory commands = abi.encodePacked(
      (uint8)(3), // Command count
      (uint8)(COMMAND_TYPE_WRAP),
      encoder.encodeWarpUniV2LikeExactInputSingle({
        factory: Mainnet.UNISWAP_V2_FACTORY_ADDR,
        fromToken: address(Mainnet.WETH),
        toToken: address(Mainnet.USDC),
        poolFeeBps: 30
      }),
      (uint8)(COMMAND_TYPE_JUMP_STARGATE),
      (uint16)(106), // dstChainId (Avalanche)
      (uint8)(1), // srcPoolId (USDC, Ethereum)
      (uint8)(1), // dstPoolId (USDC, Avalanche)
      uint32(0) // dstGasForCall
    );

    uint256 expectedSwapOut = 1567 * (10 ** 6);

    (uint256 nativeWei, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: 106,
      _functionType: 1, // swap remote
      _toAddress: abi.encodePacked(user),
      _transferAndCallPayload: '',
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    vm.deal(user, (amountIn + nativeWei));

    console2.log('Native fee: %s', nativeWei);

    vm.expectEmit(true, true, true, true);
    emit LibWarp.Warp(address(0), address(0), address(Mainnet.USDC), amountIn, 1673762736);

    vm.prank(user);
    facet.warpLinkEngage{value: amountIn + nativeWei}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC),
        commands: commands,
        amountIn: amountIn,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 100,
        deadline: deadline
      })
    );
  }

  function testFork_warpLinkEngage_jumpStargate_Usdc() public {
    uint256 amountIn = 1000 * (10 ** 6);
    address tokenIn = address(Mainnet.USDC);

    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_JUMP_STARGATE),
      (uint16)(106), // dstChainId (Avalanche)
      (uint8)(1), // srcPoolId (USDC, Ethereum)
      (uint8)(1), // dstPoolId (USDC, Avalanche)
      uint32(0) // dstGasForCall
    );

    uint256 expectedSwapOut = 1000 * (10 ** 6);

    (uint256 nativeWei, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: 106,
      _functionType: 1, // swap remote
      _toAddress: abi.encodePacked(user),
      _transferAndCallPayload: '',
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    vm.deal(user, nativeWei);
    deal(tokenIn, user, amountIn);

    console2.log('Native fee: %s', nativeWei);

    vm.prank(user);
    IERC20(tokenIn).approve(address(diamond), amountIn);

    vm.prank(user);
    facet.warpLinkEngage{value: nativeWei}(
      IWarpLink.Params({
        tokenIn: tokenIn,
        tokenOut: tokenIn,
        commands: commands,
        amountIn: amountIn,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 200,
        deadline: deadline
      })
    );
  }

  function testFork_warpLinkEngagePermit_jumpStargate_Usdc() public {
    uint256 amountIn = 1000 * (10 ** 6);
    address tokenIn = address(Mainnet.USDC);

    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_JUMP_STARGATE),
      (uint16)(106), // dstChainId (Avalanche)
      (uint8)(1), // srcPoolId (USDC, Ethereum)
      (uint8)(1), // dstPoolId (USDC, Avalanche)
      uint32(0) // dstGasForCall
    );

    uint256 expectedSwapOut = 1000 * (10 ** 6);

    (uint256 nativeWei, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: 106,
      _functionType: 1, // swap remote
      _toAddress: abi.encodePacked(user),
      _transferAndCallPayload: '',
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    vm.deal(user, nativeWei);
    deal(tokenIn, user, amountIn);

    console2.log('Native fee: %s', nativeWei);

    vm.prank(user);
    IERC20(tokenIn).approve(address(Addresses.PERMIT2), amountIn);

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: tokenIn,
        amount: uint160(amountIn),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.warpLinkEngagePermit{value: nativeWei}(
      IWarpLink.Params({
        tokenIn: tokenIn,
        tokenOut: tokenIn,
        commands: commands,
        amountIn: amountIn,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 200,
        deadline: deadline
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );
  }

  /**
   * Bridge USDC from Ethereum to Arbitrum. Then simuilate the USD being received, but on the
   * Ethereum chain, and swap it to USDT
   */
  function testFork_warpLinkEngage_jumpAndSwapToken() public {
    bytes memory destCommands = abi.encodePacked(
      (uint8)(1), // Command count
      encoder.encodeWarpUniV3LikeExactInputSingle({
        tokenOut: address(Mainnet.USDT),
        pool: 0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf
      })
    );

    IWarpLink.Params memory destParams = IWarpLink.Params({
      tokenIn: address(Mainnet.USDC),
      tokenOut: address(Mainnet.USDT),
      commands: destCommands,
      amountIn: 0, // Unused
      amountOut: 990 * (10 ** 6), // TODO
      recipient: user,
      partner: address(0),
      feeBps: 0,
      slippageBps: 0,
      deadline: deadline
    });

    bytes memory destParamsEncoded = abi.encode(destParams);

    uint256 srcAmountIn = 1000 * (10 ** 6);
    address srcTokenIn = address(Mainnet.USDC);
    uint256 dstGasForCall = 500_000;

    bytes memory sourceCommands = bytes.concat(
      abi.encodePacked(
        (uint8)(1), // Command count
        (uint8)(COMMAND_TYPE_JUMP_STARGATE),
        (uint16)(111), // dstChainId (Optimism)
        (uint8)(1), // srcPoolId (USDC, Ethereum)
        (uint8)(1), // dstPoolId (USDC, Optimism),
        uint32(dstGasForCall), // dstGasForCall, 500K
        address(Mainnet.WETH), // destParams.tokenOut
        uint256(990 * (10 ** 6)), // destParams.amountOut
        uint256(destCommands.length), // destParams.commands.length
        destCommands // destParams.commands
      )
    );

    (uint256 nativeWei, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: 111, // Optimism
      _functionType: 1, // Swap remote
      _toAddress: abi.encodePacked(address(diamond)),
      _transferAndCallPayload: destParamsEncoded,
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: dstGasForCall,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    vm.deal(user, nativeWei);
    deal(srcTokenIn, user, srcAmountIn);

    console2.log('Native fee: %s', nativeWei);

    vm.prank(user);
    IERC20(srcTokenIn).approve(address(diamond), srcAmountIn);

    vm.prank(user);
    facet.warpLinkEngage{value: nativeWei}(
      IWarpLink.Params({
        tokenIn: srcTokenIn,
        tokenOut: srcTokenIn,
        commands: sourceCommands,
        amountIn: srcAmountIn,
        amountOut: 0, // TODO
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 100,
        deadline: deadline
      })
    );

    // The router delivers 999 USDC to the diamond
    deal(address(Mainnet.USDC), address(diamond), 999 * (10 ** 6));

    // And calls sgReceive
    vm.prank(Mainnet.STARGATE_COMPOSER_ADDR);
    facet.sgReceive(
      uint16(Mainnet.CHAIN_ID), // _srcChain
      abi.encodePacked(address(diamond)), // _srcAddress
      0, // _nonce
      address(Mainnet.USDC), // _token
      990 * (10 ** 6), // amountLD
      destParamsEncoded // payload
    );

    assertApproxEqRel(Mainnet.USDC.balanceOf(user), 990 * (10 ** 6), 0.001 ether);
  }

  /**
   * Bridge USDC from Ethereum to Arbitrum. Then simuilate the USD being received, but on the
   * Ethereum chain, and swap it to USDT
   */
  function testFork_warpLinkEngagePermit_jumpAndSwap() public {
    bytes memory destCommands = abi.encodePacked(
      (uint8)(1), // Command count
      encoder.encodeWarpUniV3LikeExactInputSingle({
        tokenOut: address(Mainnet.USDT),
        pool: 0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf
      })
    );

    IWarpLink.Params memory destParams = IWarpLink.Params({
      tokenIn: address(Mainnet.USDC),
      tokenOut: address(Mainnet.USDT),
      commands: destCommands,
      amountIn: 0, // Unused
      amountOut: 990 * (10 ** 6), // TODO
      recipient: user,
      partner: address(0),
      feeBps: 0,
      slippageBps: 0,
      deadline: deadline
    });

    bytes memory destParamsEncoded = abi.encode(destParams);

    uint256 srcAmountIn = 1000 * (10 ** 6);
    address srcTokenIn = address(Mainnet.USDC);
    uint256 dstGasForCall = 500_000;

    bytes memory sourceCommands = bytes.concat(
      abi.encodePacked(
        (uint8)(1), // Command count
        (uint8)(COMMAND_TYPE_JUMP_STARGATE),
        (uint16)(111), // dstChainId (Optimism)
        (uint8)(1), // srcPoolId (USDC, Ethereum)
        (uint8)(1), // dstPoolId (USDC, Optimism),
        uint32(dstGasForCall), // dstGasForCall, 500K
        address(Mainnet.WETH), // destParams.tokenOut
        uint256(990 * (10 ** 6)), // destParams.amountOut
        uint256(destCommands.length), // destParams.commands.length
        destCommands // destParams.commands
      )
    );

    (uint256 nativeWei, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: 111, // Optimism
      _functionType: 1, // Swap remote
      _toAddress: abi.encodePacked(address(diamond)),
      _transferAndCallPayload: destParamsEncoded,
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: dstGasForCall,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    vm.deal(user, nativeWei);
    deal(srcTokenIn, user, srcAmountIn);

    console2.log('Native fee: %s', nativeWei);

    vm.prank(user);
    IERC20(srcTokenIn).approve(address(Addresses.PERMIT2), srcAmountIn);

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: srcTokenIn,
        amount: uint160(srcAmountIn),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    vm.prank(user);
    facet.warpLinkEngagePermit{value: nativeWei}(
      IWarpLink.Params({
        tokenIn: srcTokenIn,
        tokenOut: srcTokenIn,
        commands: sourceCommands,
        amountIn: srcAmountIn,
        amountOut: 0, // TODO
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 100,
        deadline: deadline
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    // The router delivers 999 USDC to the diamond
    deal(address(Mainnet.USDC), address(diamond), 999 * (10 ** 6));

    // And calls sgReceive
    vm.prank(Mainnet.STARGATE_COMPOSER_ADDR);
    facet.sgReceive(
      uint16(Mainnet.CHAIN_ID), // _srcChain
      abi.encodePacked(address(diamond)), // _srcAddress
      0, // _nonce
      address(Mainnet.USDC), // _token
      990 * (10 ** 6), // amountLD
      destParamsEncoded // payload
    );

    assertApproxEqRel(Mainnet.USDC.balanceOf(user), 990 * (10 ** 6), 0.001 ether);
  }

  function testFork_warpLinkEngage_jumpAndSwapEth() public {
    bytes memory destCommands = abi.encodePacked(
      (uint8)(2), // Command count
      (uint8)(COMMAND_TYPE_WRAP),
      encoder.encodeWarpUniV3LikeExactInputSingle({
        tokenOut: address(Mainnet.USDT),
        pool: 0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36 // WETH/USDT 0.3%
      })
    );

    IWarpLink.Params memory destParams = IWarpLink.Params({
      tokenIn: address(0),
      tokenOut: address(Mainnet.USDT),
      commands: destCommands,
      amountIn: 0, // Unused
      amountOut: 1657900441, // USDT
      recipient: user,
      partner: address(0),
      feeBps: 0,
      slippageBps: 100,
      deadline: deadline
    });

    bytes memory destParamsEncoded = abi.encode(destParams);

    uint256 srcAmountIn = 1 ether;
    address srcTokenIn = address(0);
    uint256 dstGasForCall = 500_000;

    bytes memory sourceCommands = bytes.concat(
      abi.encodePacked(
        (uint8)(1), // Command count
        (uint8)(COMMAND_TYPE_JUMP_STARGATE),
        (uint16)(111), // dstChainId, Optimism
        (uint8)(13), // srcPoolId, SGETH
        (uint8)(13), // dstPoolId, SGETH
        uint32(dstGasForCall), // dstGasForCall, 500K
        address(0), // destParams.tokenOut
        uint256(0.9 ether), // destParams.amountOut
        uint256(destCommands.length), // destParams.commands.length
        destCommands // destParams.commands
      )
    );

    (uint256 nativeWei, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: 111, // Optimism
      _functionType: 1, // Swap remote
      _toAddress: abi.encodePacked(address(diamond)),
      _transferAndCallPayload: destParamsEncoded,
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: dstGasForCall,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    vm.deal(user, nativeWei + 1 ether);

    console2.log('Native fee: %s', nativeWei);

    vm.prank(user);
    facet.warpLinkEngage{value: nativeWei + srcAmountIn}(
      IWarpLink.Params({
        tokenIn: srcTokenIn,
        tokenOut: srcTokenIn,
        commands: sourceCommands,
        amountIn: srcAmountIn,
        amountOut: 0, // TODO
        recipient: user,
        partner: address(0),
        feeBps: 0, // Unused
        slippageBps: 100,
        deadline: deadline
      })
    );

    vm.deal(address(facet), (srcAmountIn * 99) / 100);

    // And calls sgReceive
    vm.prank(Mainnet.STARGATE_COMPOSER_ADDR);
    facet.sgReceive(
      uint16(Mainnet.CHAIN_ID), // _srcChain
      abi.encodePacked(address(diamond)), // _srcAddress
      0, // _nonce
      address(0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c), // _token, SGETH
      (srcAmountIn * 99) / 100, // amountLD
      destParamsEncoded // payload
    );

    assertEq(Mainnet.USDT.balanceOf(user), 1657900441, 'usdt balance');
  }
}
