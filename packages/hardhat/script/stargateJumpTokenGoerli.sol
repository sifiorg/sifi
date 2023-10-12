// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/console2.sol';
import 'forge-std/Script.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IStargate} from 'contracts/interfaces/IStargate.sol';
import {IStargateComposer} from 'test/foundry/helpers/IStargateComposer.sol';
import {IStargateRouter} from 'contracts/interfaces/external/IStargateRouter.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {Goerli, OptimismGoerli, Addresses} from '../test/foundry/helpers/Networks.sol';
import {PermitSignature} from 'test/foundry/helpers/PermitSignature.sol';

contract StatgateJumpTokenGoerli is Script, PermitSignature {
  address goerliDiamondAddr = 0x2A104392321e978495dBC91b68914eDbA3126D9c;

  function setUp() public {}

  function run() public {
    uint256 privateKey = vm.deriveKey(vm.envString('DEV_MNEMONIC'), 1);
    address user = vm.rememberKey(privateKey);

    console2.log('User: %s', user);

    uint48 deadline = uint48(block.timestamp) + 60 * 60 * 24 * 365;

    uint160 srcAmountIn = 100 * (10 ** 6);
    uint16 dstChainId = OptimismGoerli.STARGATE_CHAIN_ID;

    (uint256 lzFee, ) = IStargateComposer(Goerli.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: dstChainId,
      _functionType: 1, // Swap remote
      _toAddress: abi.encodePacked(address(0)),
      _transferAndCallPayload: '',
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    console2.log('Native fee: %s', lzFee);

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

    IStargate(goerliDiamondAddr).stargateJumpToken{value: lzFee}(
      IStargate.JumpTokenParams({
        token: Goerli.STARGATE_MOCK_USDC_ADDR,
        amountIn: srcAmountIn,
        amountOutExpected: (srcAmountIn * 995) / 1000,
        recipient: user,
        partner: 0x1b43cBa142D18beD5FE3DB91DA04e1A90FCcdfcE,
        feeBps: 10,
        slippageBps: 100,
        deadline: deadline,
        dstChainId: dstChainId,
        srcPoolId: 1,
        dstPoolId: 1
      }),
      permitParams
    );

    vm.stopBroadcast();
  }
}
