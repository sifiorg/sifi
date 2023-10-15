// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {Addresses, Optimism} from '../helpers/Networks.sol';
import {UniV2TestHelpers} from '../helpers/UniV2.sol';
import {WarpLinkTestBase} from './TestBase.sol';

contract WarpLinkOptimismTest is WarpLinkTestBase {
  function setUp() public override {
    setUpOn(Optimism.CHAIN_ID, 109754831);
  }

  function testFork_Wrap() public {
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_WRAP)
    );

    vm.deal(user, 1 ether);

    vm.prank(user);
    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Optimism.WETH),
        commands: commands,
        amountIn: 1 ether,
        amountOut: 1 ether,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      emptyPermitParams
    );
  }

  function testFork_swapSingleUniV3() public {
    uint256 amountIn = 1 ether;
    uint256 expectedSwapOut = 1578436830;
    uint256 expectedFee = 0;

    vm.deal(user, amountIn);

    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(2), // Command count
        (uint8)(COMMAND_TYPE_WRAP)
      ),
      encoder.encodeWarpUniV3LikeExactInputSingle({
        tokenOut: address(Optimism.USDT),
        pool: 0xc858A329Bf053BE78D6239C4A4343B8FbD21472b // WETH/USDT ?%
      })
    );

    vm.prank(user);
    facet.warpLinkEngage{value: amountIn}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Optimism.USDT),
        commands: commands,
        amountIn: amountIn,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      emptyPermitParams
    );

    assertEq(Optimism.USDT.balanceOf(user), expectedSwapOut - expectedFee, 'after');
  }
}
