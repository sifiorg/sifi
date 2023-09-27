// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/console2.sol';
import 'forge-std/Script.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {WarpLinkCommandTypes} from 'contracts/facets/WarpLink.sol';
import {IStargateRouter} from 'test/foundry/helpers/IStargateRouter.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {Goerli, OptimismGoerli, Addresses} from '../test/foundry/helpers/Networks.sol';
import {PermitSignature} from 'test/foundry/helpers/PermitSignature.sol';

/**
 * Bridge mock USDC from Goerli to Optimism-Goerli and invoke WarpLink on the other
 * side, but with no commands.
 *
 * Adding commands would be even more interesting, but
 * there are no actions that can be made using Statgate mock USDC.
 *
 * Invoke this script using:
 * forge script script/jump.sol --rpc-url goerli --no-storage-caching -vvvv --broadcast
 */
contract JumpGoerli is Script, WarpLinkCommandTypes, PermitSignature {
  address goerliDiamondAddr = 0x2A104392321e978495dBC91b68914eDbA3126D9c;

  function setUp() public {}

  function run() public {
    uint256 privateKey = vm.deriveKey(vm.envString('DEV_MNEMONIC'), 1);
    address user = vm.rememberKey(privateKey);

    console2.log('User: %s', user);

    uint48 deadline = uint48(block.timestamp) + 60 * 60 * 24 * 365;

    IWarpLink.Params memory destParams = IWarpLink.Params({
      tokenIn: address(0), // Unused
      tokenOut: OptimismGoerli.STARGATE_MOCK_USDC_ADDR,
      commands: abi.encodePacked(
        (uint8)(0) // Command count
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

    uint256 srcAmountIn = 100 * (10 ** 6);
    uint256 dstGasForCall = 500_000;
    uint16 dstChainId = OptimismGoerli.STARGATE_CHAIN_ID;

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

    (uint256 nativeWei, ) = IStargateRouter(Goerli.STARGATE_ROUTER_ADDR).quoteLayerZeroFee({
      _dstChainId: dstChainId, // Goerli
      _functionType: 1, // Swap remote
      _toAddress: abi.encodePacked(goerliDiamondAddr),
      _transferAndCallPayload: destParamsEncoded,
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: dstGasForCall,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    console2.log('Native fee: %s', nativeWei);

    {
      uint256 srcTokenInAllowance = IERC20(Goerli.STARGATE_MOCK_USDC_ADDR).allowance(
        user,
        address(Addresses.PERMIT2)
      );

      console2.log('srcTokenInAllowance: %s', srcTokenInAllowance);

      if (srcTokenInAllowance < srcAmountIn) {
        vm.startBroadcast(user);

        SafeERC20.forceApprove(
          IERC20(Goerli.STARGATE_MOCK_USDC_ADDR),
          address(Addresses.PERMIT2),
          type(uint256).max
        );

        vm.stopBroadcast();
      }
    }

    PermitParams memory permitParams;

    {
      (, , uint48 nonce) = Addresses.PERMIT2.allowance(
        user,
        Goerli.STARGATE_MOCK_USDC_ADDR,
        address(goerliDiamondAddr)
      );

      IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
        IAllowanceTransfer.PermitDetails({
          token: Goerli.STARGATE_MOCK_USDC_ADDR,
          amount: uint160(srcAmountIn),
          expiration: deadline,
          nonce: nonce
        }),
        address(goerliDiamondAddr),
        deadline
      );

      bytes memory sig = getPermitSignature(
        permit,
        privateKey,
        Addresses.PERMIT2.DOMAIN_SEPARATOR()
      );

      permitParams = PermitParams({nonce: nonce, signature: sig});
    }

    vm.startBroadcast(user);

    IWarpLink(goerliDiamondAddr).warpLinkEngage{value: nativeWei}(
      IWarpLink.Params({
        tokenIn: Goerli.STARGATE_MOCK_USDC_ADDR,
        tokenOut: Goerli.STARGATE_MOCK_USDC_ADDR,
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
