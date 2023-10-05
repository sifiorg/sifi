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
 * forge script script/jumpAndEngageGoerli.sol --rpc-url goerli --no-storage-caching -vvvv --broadcast
 */
contract JumpAndEngageEthGoerli is Script, WarpLinkCommandTypes, PermitSignature {
  address goerliDiamondAddr = 0x2A104392321e978495dBC91b68914eDbA3126D9c;

  function setUp() public {}

  function run() public {
    uint256 privateKey = vm.deriveKey(vm.envString('DEV_MNEMONIC'), 1);
    address user = vm.rememberKey(privateKey);

    console2.log('User: %s', user);

    uint48 deadline = uint48(block.timestamp) + 60 * 60 * 24 * 365;

    bytes memory destCommands = abi.encodePacked(
      (uint8)(0) // Command count
    );

    // NOTE: Only including vartiable length field
    bytes memory destParamsEncoded;

    {
      IWarpLink.Params memory destParams;
      destParams.commands = destCommands;

      destParamsEncoded = abi.encode(destParams);
    }

    uint256 srcAmountIn = 0.0005 ether;
    uint256 dstGasForCall = 500_000;
    uint16 dstChainId = OptimismGoerli.STARGATE_CHAIN_ID;

    bytes memory sourceCommands = bytes.concat(
      abi.encodePacked(
        (uint8)(1), // Command count
        (uint8)(COMMAND_TYPE_JUMP_STARGATE),
        (uint16)(dstChainId), // dstChainId
        (uint8)(13), // srcPoolId (SGETH)
        (uint8)(13), // dstPoolId (SGETH),
        uint32(dstGasForCall), // dstGasForCall
        address(0), // destParams.tokenOut
        // NOTE: There's massive slippage on the testnet
        uint256((srcAmountIn * 99) / 100), // destParams.amountOut
        uint256(destCommands.length) // destParams.commands.length
      ),
      destCommands // destParams.commands
    );

    (uint256 nativeWei, ) = IStargateComposer(Goerli.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: dstChainId,
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

    PermitParams memory permitParams;

    vm.startBroadcast(user);

    console2.log('User balance: %s', user.balance);

    IWarpLink(goerliDiamondAddr).warpLinkEngage{value: nativeWei + srcAmountIn}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(0),
        commands: sourceCommands,
        amountIn: srcAmountIn,
        amountOut: srcAmountIn,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        // NOTE: There's massive slippage on the testnet
        slippageBps: 100 * 20,
        deadline: deadline
      }),
      permitParams
    );

    vm.stopBroadcast();
  }
}
