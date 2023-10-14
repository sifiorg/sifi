// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {IStargateRouter} from 'contracts/interfaces/external/IStargateRouter.sol';
import {Addresses, Goerli} from '../helpers/Networks.sol';
import {UniV2TestHelpers} from '../helpers/UniV2.sol';
import {IStargateComposer} from '../helpers/IStargateComposer.sol';
import {WarpLinkTestBase} from './TestBase.sol';

contract WarpLinkGoerliTest is WarpLinkTestBase {
  function setUp() public override {
    setUpOn(Goerli.CHAIN_ID, 9755539);
  }

  function testFork_jumpStargate_Usdc() public {
    uint256 amountIn = 1000 * (10 ** 6);

    // NOTE: Mock USDC from https://stargateprotocol.gitbook.io/stargate/developers/contract-addresses/testnet
    address tokenIn = address(0xDf0360Ad8C5ccf25095Aa97ee5F2785c8d848620);

    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_JUMP_STARGATE),
      (uint16)(10132), // dstChainId: Optimism-Goerli
      (uint8)(1), // srcPoolId: USDC, Ethereum-Goerli
      (uint8)(1), // dstPoolId: USDC, Optimism-Goerli
      uint32(0) // dstGasForCall
    );

    uint256 expectedSwapOut = 1000 * (10 ** 6);

    (uint256 nativeWei, ) = IStargateComposer(Goerli.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: 10132,
      _functionType: 1, // swap remote
      _toAddress: abi.encodePacked(USER),
      _transferAndCallPayload: '',
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    vm.deal(USER, nativeWei);
    deal(tokenIn, USER, amountIn);

    vm.prank(USER);
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

    bytes memory sig = getPermitSignature(permit, USER_PRIV, permit2.DOMAIN_SEPARATOR());

    vm.prank(USER);
    facet.warpLinkEngage{value: nativeWei}(
      IWarpLink.Params({
        tokenIn: tokenIn,
        tokenOut: tokenIn,
        commands: commands,
        amountIn: amountIn,
        amountOut: expectedSwapOut,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        // NOTE: There is massive slippage on the testnet
        slippageBps: 100 * 20,
        deadline: deadline
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );
  }
}
