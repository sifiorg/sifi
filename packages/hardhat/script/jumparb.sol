// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/console2.sol';
import 'forge-std/Script.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {WarpLinkCommandTypes} from 'contracts/facets/WarpLink.sol';
import {IStargateComposer} from 'test/foundry/helpers/IStargateComposer.sol';
import {IStargateRouter} from 'contracts/interfaces/external/IStargateRouter.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {Addresses, Arbitrum, Mainnet} from '../test/foundry/helpers/Networks.sol';
import {PermitSignature} from 'test/foundry/helpers/PermitSignature.sol';

contract JumpUsdcArb is Script, WarpLinkCommandTypes, PermitSignature {
  address diamondAddr = 0x65c49E9996A877d062085B71E1460fFBe3C4c5Aa;

  function setUp() public {}

  function run() public {
    uint256 privateKey = vm.deriveKey(vm.envString('DEV_MNEMONIC'), 1);
    address user = vm.rememberKey(privateKey);

    console2.log('User: %s', user);
    console2.log('Chain ID: %s', block.chainid);
    console2.log('Block number: %s', block.number);

    uint48 deadline = uint48(block.timestamp) + 60 * 60 * 24 * 365;

    IWarpLink.Params memory destParams = IWarpLink.Params({
      tokenIn: address(0), // Unused
      tokenOut: address(0x912CE59144191C1204E64559FE8253a0e49E6548), // ARB-arbitrum
      commands: abi.encodePacked(
        uint8(1), // Command count
        uint8(COMMAND_TYPE_WARP_UNI_V3_LIKE_EXACT_INPUT_SINGLE),
        address(0x912CE59144191C1204E64559FE8253a0e49E6548), // tokenOut, ARB
        address(0xcDa53B1F66614552F834cEeF361A8D12a0B8DaD8) // pool, ARB/USDC 0.05%
      ),
      amountIn: 0, // Unused
      amountOut: 0, // TODO
      recipient: user,
      partner: address(0),
      feeBps: 0,
      slippageBps: 0,
      deadline: deadline
    });

    bytes memory destParamsEncoded = abi.encode(destParams);

    uint256 srcAmountIn = 5 * (10 ** 6); // 5 USDC
    uint256 dstGasForCall = 200_000;
    // uint16 dstChainId = Arbitrum.STARGATE_CHAIN_ID;
    uint16 dstChainId = 111; // op

    bytes memory sourceCommands = bytes.concat(
      abi.encodePacked(
        (uint8)(1), // Command count
        (uint8)(COMMAND_TYPE_JUMP_STARGATE),
        (uint16)(dstChainId), // dstChainId
        (uint8)(1), // srcPoolId (USDC)
        (uint8)(1), // dstPoolId (USDC),
        uint32(dstGasForCall), // dstGasForCall
        uint256(destParamsEncoded.length) // NOTE: Unnecessarily large type
      ),
      destParamsEncoded
    );

    (uint256 nativeWei, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: dstChainId,
      _functionType: 1, // Swap remote
      _toAddress: abi.encodePacked(diamondAddr),
      _transferAndCallPayload: destParamsEncoded,
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: dstGasForCall,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    console2.log('Native fee: %s', nativeWei);

    {
      vm.startBroadcast(user);

      uint256 srcTokenInAllowance = Mainnet.USDC.allowance(user, address(Addresses.PERMIT2));

      console2.log('srcTokenInAllowance: %s', srcTokenInAllowance);

      if (srcTokenInAllowance < srcAmountIn) {
        SafeERC20.forceApprove(Mainnet.USDC, address(Addresses.PERMIT2), type(uint256).max);
      }

      vm.stopBroadcast();
    }

    PermitParams memory permitParams;

    {
      (, , uint48 nonce) = Addresses.PERMIT2.allowance(
        user,
        address(Mainnet.USDC),
        address(diamondAddr)
      );

      IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
        IAllowanceTransfer.PermitDetails({
          token: address(Mainnet.USDC),
          amount: uint160(srcAmountIn),
          expiration: deadline,
          nonce: nonce
        }),
        address(diamondAddr),
        deadline
      );

      bytes memory sig = getPermitSignature(
        permit,
        privateKey,
        Addresses.PERMIT2.DOMAIN_SEPARATOR()
      );

      permitParams = PermitParams({nonce: nonce, signature: sig});
    }

    IWarpLink(diamondAddr).warpLinkEngagePermit{value: nativeWei}(
      IWarpLink.Params({
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.USDC),
        commands: sourceCommands,
        amountIn: srcAmountIn,
        amountOut: 0, // TODO
        recipient: address(0), // Unused
        partner: address(0), // Unused
        feeBps: 0, // Unused
        slippageBps: 0,
        deadline: deadline
      }),
      permitParams
    );

    vm.stopBroadcast();
  }
}
