// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {Addresses, Mainnet} from '../helpers/Networks.sol';
import {WarpLinkTestBase} from './TestBase.sol';

contract WarpLinkMainnet18069811Test is WarpLinkTestBase {
  function setUp() public override {
    setUpOn(1, 18069811);
  }

  function testFork_paraswapVector() public {
    // 0. permit for APE
    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: address(Mainnet.APE),
      amount: (uint160)(1000 ether),
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      USER_PRIV,
      permit2.DOMAIN_SEPARATOR()
    );

    // 1.1: 92.5% of split 1 will swap Uni V2 APE -> WETH, unwrap
    bytes memory commandsSplit1_1 = bytes.concat(
      abi.encodePacked(
        (uint16)(92_50), // TODO: Split less than 1%
        (uint8)(2) // Command count
      ),
      encoder.encodeWarpUniV2LikeExactInputSingle({
        factory: Mainnet.UNISWAP_V2_FACTORY_ADDR,
        fromToken: address(Mainnet.APE),
        toToken: address(Mainnet.WETH),
        poolFeeBps: 30
      }),
      abi.encodePacked((uint8)(COMMAND_TYPE_UNWRAP))
    );

    // 1.2: 7.5% of split 1 will swap Uni V2 APE -> WETH on Sushi V2, unwrap
    bytes memory commandsSplit1_2 = bytes.concat(
      abi.encodePacked(
        (uint8)(2) // Command count
      ),
      encoder.encodeWarpUniV2LikeExactInputSingle({
        factory: Mainnet.SUSHISWAP_V2_FACTORY,
        fromToken: address(Mainnet.APE),
        toToken: address(Mainnet.WETH),
        poolFeeBps: 30
      }),
      abi.encodePacked((uint8)(COMMAND_TYPE_UNWRAP))
    );

    // 1: Split 1 will swap APE -> WETH -> Unwrap in two, wrap the ETH,  and then WETH to USDC on Uni V2
    bytes memory commandsSplit1 = bytes.concat(
      abi.encodePacked(
        (uint8)(3), // Command count
        (uint8)(COMMAND_TYPE_SPLIT),
        (uint8)(2) // Split count
      ),
      commandsSplit1_1,
      commandsSplit1_2,
      abi.encodePacked((uint8)(COMMAND_TYPE_WRAP)),
      encoder.encodeWarpUniV2LikeExactInputSingle({
        factory: Mainnet.UNISWAP_V2_FACTORY_ADDR,
        fromToken: address(Mainnet.WETH),
        toToken: address(Mainnet.USDC),
        poolFeeBps: 30
      })
    );

    // 2: Swap APE->USDT->USDC on UniswapForkOptimized (looks like Sushi)
    address[] memory commandsSplit2Tokens = new address[](2);
    commandsSplit2Tokens[0] = address(Mainnet.USDT);
    commandsSplit2Tokens[1] = address(Mainnet.USDC);

    address[] memory commandsSplit2Pools = new address[](2);
    commandsSplit2Pools[0] = 0xB27C7b131Cf4915BeC6c4Bc1ce2F33f9EE434b9f;
    commandsSplit2Pools[1] = 0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f;

    uint16[] memory commandsSplit2PoolFeeBps = new uint16[](2);
    commandsSplit2PoolFeeBps[0] = 30;
    commandsSplit2PoolFeeBps[1] = 30;

    bytes memory commandsSplit2 = bytes.concat(
      abi.encodePacked(
        (uint8)(1) // Command count
      ),
      encoder.encodeWarpUniV2LikeExactInput({
        tokens: commandsSplit2Tokens,
        pools: commandsSplit2Pools,
        poolFeesBps: commandsSplit2PoolFeeBps
      })
    );

    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(1), // Command count
        (uint8)(COMMAND_TYPE_SPLIT),
        (uint8)(2), // Split count,
        (uint16)(80_00) // Split %
      ),
      commandsSplit1,
      commandsSplit2
    );

    // The output is 5% less than the quote on Paraswap because
    // of the pools used in the final 20% split. See the Paraswap route
    // with numbers at https://gist.github.com/xykota/12e905bbde4d7b617176bf8da50423f7
    uint256 expectedSwapOut = uint256(1300374471 * 950) / 1000;
    uint256 expectedFee = 0;

    deal(address(Mainnet.APE), USER, 1000 ether);

    vm.prank(USER);
    Mainnet.APE.approve(address(Addresses.PERMIT2), 1000 ether);

    vm.prank(USER);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.APE),
        tokenOut: address(Mainnet.USDC),
        commands: commands,
        amountIn: 1000 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 10,
        deadline: deadline
      }),
      PermitParams({nonce: 0, signature: sig})
    );

    assertEq(Mainnet.USDC.balanceOf(USER), expectedSwapOut - expectedFee, 'usdc balance after');
  }

  receive() external payable {}
}
