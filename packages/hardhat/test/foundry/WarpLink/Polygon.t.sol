// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {Addresses, Polygon} from '../helpers/Networks.sol';
import {UniV2TestHelpers} from '../helpers/UniV2.sol';
import {WarpLinkTestBase} from './TestBase.sol';

contract WarpLinkPolygonTest is WarpLinkTestBase {
  function setUp() public override {
    setUpOn(Polygon.CHAIN_ID, 47436715);
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
        tokenOut: address(Polygon.WMATIC),
        commands: commands,
        amountIn: 1 ether,
        amountOut: 1 ether,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );
  }

  function testFork_warpLinkEngage_swapSingleUniV3() public {
    uint256 amountIn = 1 ether;
    uint256 expectedSwapOut = 506478;
    uint256 expectedFee = 0;

    vm.deal(user, amountIn);

    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(2), // Command count
        (uint8)(COMMAND_TYPE_WRAP)
      ),
      encoder.encodeWarpUniV3LikeExactInputSingle({
        tokenOut: address(Polygon.USDC),
        pool: 0xA374094527e1673A86dE625aa59517c5dE346d32 // MATIC/USDC 0.05%
      })
    );

    vm.prank(user);
    facet.warpLinkEngage{value: amountIn}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Polygon.USDC),
        commands: commands,
        amountIn: amountIn,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );

    assertEq(Polygon.USDC.balanceOf(user), expectedSwapOut - expectedFee, 'after');
  }
}
