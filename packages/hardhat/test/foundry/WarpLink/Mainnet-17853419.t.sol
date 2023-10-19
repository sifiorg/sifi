// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {LibWarp} from 'contracts/libraries/LibWarp.sol';
import {Addresses, Mainnet} from '../helpers/Networks.sol';
import {UniV2TestHelpers} from '../helpers/UniV2.sol';
import {WarpLinkTestBase} from './TestBase.sol';

contract WarpLinkMainnet17853419Test is WarpLinkTestBase {
  function setUp() public override {
    setUpOn(1, 17853419);
  }

  function testFork_Wrap() public {
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_WRAP)
    );

    vm.deal(user, 1 ether);
    vm.prank(user);

    vm.expectEmit(true, true, true, true);
    emit LibWarp.Warp(partner, address(0), address(Mainnet.WETH), 1 ether, 0.999 ether);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.WETH),
        commands: commands,
        amountIn: 1 ether,
        amountOut: 1 ether,
        recipient: user,
        partner: partner,
        feeBps: 10,
        slippageBps: 0,
        deadline: deadline
      }),
      emptyPermitParams
    );
  }

  function testFork_Unwrap() public {
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_UNWRAP)
    );

    vm.prank(user);
    Mainnet.WETH.approve(address(Addresses.PERMIT2), 2 ether);

    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: address(Mainnet.WETH),
      amount: 1 ether,
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      privateKey,
      permit2.DOMAIN_SEPARATOR()
    );

    deal(address(Mainnet.WETH), user, 1 ether);
    vm.prank(user);

    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(0),
        commands: commands,
        amountIn: 1 ether,
        amountOut: 1 ether,
        recipient: user,
        partner: address(0),
        feeBps: 10,
        slippageBps: 0,
        deadline: deadline
      }),
      PermitParams({nonce: details.nonce, signature: sig})
    );
  }

  function testFork_swapSingleUniV2Sushi() public {
    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: address(Mainnet.WETH),
      amount: 1 ether,
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      privateKey,
      permit2.DOMAIN_SEPARATOR()
    );

    // Swap WETH to DAI on Sushiswap V2
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(1) // Command count
      ),
      encoder.encodeWarpUniV2LikeExactInputSingle({
        factory: Mainnet.SUSHISWAP_V2_FACTORY,
        fromToken: address(Mainnet.WETH),
        toToken: address(Mainnet.DAI),
        poolFeeBps: 30
      })
    );

    uint256 expectedSwapOut = 1828982820960382500646;
    uint256 expectedFee = 0;

    vm.prank(user);
    Mainnet.WETH.approve(address(Addresses.PERMIT2), 1 ether);

    deal(address(Mainnet.WETH), user, 1 ether);
    vm.prank(user);

    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      PermitParams({nonce: details.nonce, signature: sig})
    );

    assertEq(Mainnet.DAI.balanceOf(user), expectedSwapOut - expectedFee, 'dai balance after swap');
  }

  function testFork_wrapAndSwapSingleUniV2Sushi() public {
    // Swap ETH to DAI on Sushiswap V2
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(2), // Command count
        (uint8)(COMMAND_TYPE_WRAP)
      ),
      encoder.encodeWarpUniV2LikeExactInputSingle({
        factory: Mainnet.SUSHISWAP_V2_FACTORY,
        fromToken: address(Mainnet.WETH),
        toToken: address(Mainnet.DAI),
        poolFeeBps: 30
      })
    );

    uint256 expectedSwapOut = 1828982820960382500646;
    uint256 expectedFee = 0;

    vm.deal(user, 1 ether);
    vm.prank(user);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      emptyPermitParams
    );

    assertEq(Mainnet.DAI.balanceOf(user), expectedSwapOut - expectedFee, 'dai balance after swap');
  }

  function testFork_wrapAndSwapSingleUniV2Chained() public {
    // Wrap ETH, swap the WETH to DAI on Sushi and finally the DAI to USDC on Uniswap
    bytes memory commands = abi.encodePacked(
      (uint8)(3), // Command count
      (uint8)(COMMAND_TYPE_WRAP),
      (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
      (address)(Mainnet.DAI), // WarpUniV2LikeSwapSingleParams.tokenOut
      (address)(
        UniV2TestHelpers.getPair(
          Mainnet.SUSHISWAP_V2_FACTORY,
          address(Mainnet.WETH),
          address(Mainnet.DAI)
        )
      ), // WarpUniV2LikeSwapSingleParams.pool
      (uint8)(address(Mainnet.WETH) < address(Mainnet.DAI) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
      (uint16)(30), // WarpUniV2LikeSwapSingleParams.poolFeeBps
      (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
      (address)(Mainnet.USDC), // WarpUniV2LikeSwapSingleParams.tokenOut
      (address)(
        UniV2TestHelpers.getPair(
          Mainnet.UNISWAP_V2_FACTORY_ADDR,
          address(Mainnet.DAI),
          address(Mainnet.USDC)
        )
      ), // WarpUniV2LikeSwapSingleParams.pool
      (uint8)(address(Mainnet.DAI) < address(Mainnet.USDC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
      (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
    );

    uint256 expectedSwapOut = 1824825184;
    uint256 expectedFee = 0;

    vm.deal(user, 1 ether);
    vm.prank(user);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      emptyPermitParams
    );

    assertEq(
      Mainnet.USDC.balanceOf(user),
      expectedSwapOut - expectedFee,
      'usdc balance after swap'
    );
  }

  function testFork_splitWrap() public {
    // Split into 3 wraps
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_SPLIT),
      (uint8)(3), // 3 splits
      (uint16)(33_00), // Split 1 has 33%
      (uint8)(1), // Split 1 Command count
      (uint8)(COMMAND_TYPE_WRAP),
      (uint16)(33_00), // Split 2 has 33%
      (uint8)(1), // Split 3 Command count
      (uint8)(COMMAND_TYPE_WRAP),
      (uint8)(1), // Split 3 Command count
      (uint8)(COMMAND_TYPE_WRAP) // Split 3 has remaining %
    );

    uint256 expectedSwapOut = 1 ether;
    uint256 expectedFee = 0;

    vm.deal(user, 1 ether);
    vm.prank(user);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.WETH),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      emptyPermitParams
    );

    assertEq(Mainnet.WETH.balanceOf(user), expectedSwapOut - expectedFee, 'weth balance after');
  }

  function testFork_wrapSplitSwap() public {
    // Wrap and split into 2 swaps, 70% WETH->WBTC on Uni V2, 30% WETH->WBTC on Sushi V2
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(2), // Command count
        (uint8)(COMMAND_TYPE_WRAP),
        (uint8)(COMMAND_TYPE_SPLIT),
        (uint8)(2), // Split count
        (uint16)(70_00), // Split 1: 70%
        (uint8)(1), // Split 1: Command count
        (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          UniV2TestHelpers.getPair(
            Mainnet.UNISWAP_V2_FACTORY_ADDR,
            address(Mainnet.WETH),
            address(Mainnet.WBTC)
          )
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      ),
      abi.encodePacked(
        (uint8)(1), // Split 2: Command count
        (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          UniV2TestHelpers.getPair(
            Mainnet.SUSHISWAP_V2_FACTORY,
            address(Mainnet.WETH),
            address(Mainnet.WBTC)
          )
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      )
    );

    uint256 expectedSwapOut = 4_422_050 + 1_891_944;
    uint256 expectedFee = 0;

    vm.deal(user, 1 ether);
    vm.prank(user);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.WBTC),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      emptyPermitParams
    );

    assertEq(Mainnet.WBTC.balanceOf(user), expectedSwapOut - expectedFee, 'wbtc balance after');
  }

  function testFork_wrapSplitSwapNested() public {
    // Wrap and split into 2:
    //   - Split 1: (70%)
    //     - Split into 2:
    //       - Split 1.1: 50%
    //         - Swap WETH->WBTC on Uni V2
    //       - Split 1.2: 50%
    //         - Swap WETH->USDC->WBTC on Uni V2
    //   - Split 2: (30%)
    //     - Swap WETH->WBTC on Sushi V2
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(2), // Command count
        (uint8)(COMMAND_TYPE_WRAP),
        (uint8)(COMMAND_TYPE_SPLIT),
        (uint8)(2) // Split count
      ),
      abi.encodePacked(
        (uint16)(70_00), // Split 1: 70%
        (uint8)(1), // Split 1: Command count
        (uint8)(COMMAND_TYPE_SPLIT),
        (uint8)(2) // Split count
      ),
      abi.encodePacked(
        (uint16)(50_00), // Split 1.1: 50%
        (uint8)(2), // Split 1.1: Command count
        (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
        (address)(Mainnet.USDC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          UniV2TestHelpers.getPair(
            Mainnet.UNISWAP_V2_FACTORY_ADDR,
            address(Mainnet.WETH),
            address(Mainnet.USDC)
          )
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.USDC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      ),
      abi.encodePacked(
        // Split 1.1 second swap
        (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          UniV2TestHelpers.getPair(
            Mainnet.UNISWAP_V2_FACTORY_ADDR,
            address(Mainnet.USDC),
            address(Mainnet.WBTC)
          )
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.USDC) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      ),
      abi.encodePacked(
        (uint8)(1), // Split 1.2: Command count
        (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          UniV2TestHelpers.getPair(
            Mainnet.UNISWAP_V2_FACTORY_ADDR,
            address(Mainnet.WETH),
            address(Mainnet.WBTC)
          )
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      ),
      abi.encodePacked(
        (uint8)(1), // Split 2: Command count
        (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          UniV2TestHelpers.getPair(
            Mainnet.SUSHISWAP_V2_FACTORY,
            address(Mainnet.WETH),
            address(Mainnet.WBTC)
          )
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      )
    );

    uint256 expectedSwapOut = 2168604 + 2211324 + 1891944;
    uint256 expectedFee = 0;

    vm.deal(user, 1 ether);
    vm.prank(user);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.WBTC),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      emptyPermitParams
    );

    assertEq(Mainnet.WBTC.balanceOf(user), expectedSwapOut - expectedFee, 'wbtc balance after');
  }

  function testFork_univ2LikeMulti() public {
    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: address(Mainnet.USDC),
      amount: 1000 * (10 ** 6),
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      privateKey,
      permit2.DOMAIN_SEPARATOR()
    );

    // Swap USDC through USDT to APE on Sushi V2
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(1), // Command count
        (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT),
        (uint8)(2), // Pool count
        (address)(Mainnet.USDT), // token 0
        (address)(Mainnet.APE), // token 1
        (address)(
          UniV2TestHelpers.getPair(
            Mainnet.SUSHISWAP_V2_FACTORY,
            address(Mainnet.USDC),
            address(Mainnet.USDT)
          )
        ), // pair 0
        (address)(
          UniV2TestHelpers.getPair(
            Mainnet.SUSHISWAP_V2_FACTORY,
            address(Mainnet.USDT),
            address(Mainnet.APE)
          )
        ), // pair 1
        (uint16)(30), // pool fee bps 0
        (uint16)(30) // pool fee bps 1
      )
    );

    uint256 expectedSwapOut = 247478888382075850448;
    uint256 expectedFee = 0;

    deal(address(Mainnet.USDC), user, 1000 * (10 ** 6));

    vm.prank(user);
    Mainnet.USDC.approve(address(Addresses.PERMIT2), 1000 * (10 ** 6));

    vm.prank(user);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.APE),
        commands: commands,
        amountIn: 1000 * (10 ** 6),
        amountOut: 247478888382075850448,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      PermitParams({nonce: details.nonce, signature: sig})
    );

    assertEq(Mainnet.APE.balanceOf(user), expectedSwapOut - expectedFee, 'ape balance after');
  }

  function testFork_positiveSlippage() public {
    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: address(Mainnet.WETH),
      amount: 1 ether,
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      privateKey,
      permit2.DOMAIN_SEPARATOR()
    );
    // Swap WETH to DAI on Sushiswap V2
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
      (address)(Mainnet.DAI), // WarpUniV2LikeSwapSingleParams.tokenOut
      (address)(
        UniV2TestHelpers.getPair(
          Mainnet.SUSHISWAP_V2_FACTORY,
          address(Mainnet.WETH),
          address(Mainnet.DAI)
        )
      ), // WarpUniV2LikeSwapSingleParams.pool
      (uint8)(address(Mainnet.WETH) < address(Mainnet.DAI) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
      (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
    );

    uint256 expectedSwapOut = 1828982820960382500646;
    uint256 expectedFee = 0;

    vm.prank(user);
    Mainnet.WETH.approve(address(Addresses.PERMIT2), 1 ether);

    deal(address(Mainnet.WETH), user, 1 ether);
    vm.prank(user);

    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut + 100,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 10,
        deadline: deadline
      }),
      PermitParams({nonce: details.nonce, signature: sig})
    );

    assertEq(Mainnet.DAI.balanceOf(user), expectedSwapOut - expectedFee, 'dai balance after swap');
  }

  function testFork_collectFee() public {
    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: address(Mainnet.WETH),
      amount: 1 ether,
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      privateKey,
      permit2.DOMAIN_SEPARATOR()
    );
    // Swap WETH to DAI on Sushiswap V2
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count,
      (uint8)(COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE),
      (address)(Mainnet.DAI), // WarpUniV2LikeSwapSingleParams.tokenOut
      (address)(
        UniV2TestHelpers.getPair(
          Mainnet.SUSHISWAP_V2_FACTORY,
          address(Mainnet.WETH),
          address(Mainnet.DAI)
        )
      ), // WarpUniV2LikeSwapSingleParams.pool
      (uint8)(address(Mainnet.WETH) < address(Mainnet.DAI) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
      (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
    );

    uint256 expectedSwapOut = 1828982820960382500646;
    uint256 expectedFee = (expectedSwapOut * 15) / 10_000;

    deal(address(Mainnet.WETH), user, 1 ether);

    vm.prank(user);
    Mainnet.WETH.approve(address(Addresses.PERMIT2), 1 ether);

    vm.expectEmit(true, true, true, false);
    emit Fee(address(0), address(Mainnet.DAI), 0, expectedFee);

    vm.prank(user);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 15,
        slippageBps: 0,
        deadline: deadline
      }),
      PermitParams({nonce: details.nonce, signature: sig})
    );

    assertEq(Mainnet.DAI.balanceOf(user), expectedSwapOut - expectedFee, 'dai balance after swap');
  }

  function testFork_deadline() public {
    bytes memory commands = abi.encodePacked(
      (uint8)(0) // Command count
    );

    vm.expectRevert(abi.encodeWithSelector(IWarpLink.DeadlineExpired.selector));

    vm.prank(user);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: 1234,
        recipient: user,
        partner: address(0),
        feeBps: 15,
        slippageBps: 0,
        deadline: (uint48)(deadline - 2)
      }),
      emptyPermitParams
    );
  }

  function testFork_swapSingleUniV3() public {
    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: address(Mainnet.USDC),
      amount: 1000 * (10 ** 6),
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      privateKey,
      permit2.DOMAIN_SEPARATOR()
    );

    // Swap USDC to USDT on Uniswap V3
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(1) // Command count
      ),
      encoder.encodeWarpUniV3LikeExactInputSingle({
        tokenOut: address(Mainnet.USDT),
        pool: 0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf
      })
    );

    uint256 amountIn = 1000 * (10 ** 6);
    uint256 expectedSwapOut = 1000967411;
    uint256 expectedFee = 0;

    deal(address(Mainnet.USDC), user, amountIn);

    vm.prank(user);
    Mainnet.USDC.approve(address(Addresses.PERMIT2), amountIn);

    vm.prank(user);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.USDT),
        commands: commands,
        amountIn: amountIn,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      PermitParams({nonce: details.nonce, signature: sig})
    );

    assertEq(Mainnet.USDT.balanceOf(user), expectedSwapOut - expectedFee, 'usdt balance after');
  }

  function testFork_univ3LikeMulti() public {
    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: address(Mainnet.USDC),
      amount: 1000 * (10 ** 6),
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      privateKey,
      permit2.DOMAIN_SEPARATOR()
    );

    // Swap USDC through USDT to WETH on Uniswap V3
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(1), // Command count
        (uint8)(COMMAND_TYPE_WARP_UNI_V3_LIKE_EXACT_INPUT),
        (uint8)(2), // Pool count
        (address)(Mainnet.USDT), // token 0
        (address)(Mainnet.WETH), // token 1
        (address)(0x7858E59e0C01EA06Df3aF3D20aC7B0003275D4Bf), // pair 0
        (address)(0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36) // pair 1
      )
    );

    uint256 expectedSwapOut = 544005533891390927;
    uint256 expectedFee = 0;

    deal(address(Mainnet.USDC), user, 1000 * (10 ** 6));

    vm.prank(user);
    Mainnet.USDC.approve(address(Addresses.PERMIT2), 1000 * (10 ** 6));

    vm.prank(user);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.WETH),
        commands: commands,
        amountIn: 1000 * (10 ** 6),
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      PermitParams({nonce: details.nonce, signature: sig})
    );

    assertEq(Mainnet.WETH.balanceOf(user), expectedSwapOut - expectedFee, 'weth balance after');
  }

  function testFork_warpCurve_EthToSteth() public {
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_WARP_CURVE_EXACT_INPUT_SINGLE),
      (address)(Mainnet.STETH), // tokenOut
      (address)(0xDC24316b9AE028F1497c275EB9192a3Ea0f67022), // pool
      (uint8)(0), // i (eth)
      (uint8)(1), // j (steth)
      (uint8)(1), // kind
      (uint8)(0) // underlying
    );

    uint256 expectedSwapOut = 1 ether;
    uint256 expectedFee = 0;

    vm.deal(user, 1 ether);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.STETH),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      }),
      emptyPermitParams
    );

    assertApproxEqRel(Mainnet.STETH.balanceOf(user), expectedSwapOut - expectedFee, 0.001 ether);
  }

  function testFork_warpCurve_StethToEth() public {
    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: address(Mainnet.STETH),
      amount: 1 ether,
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      privateKey,
      permit2.DOMAIN_SEPARATOR()
    );

    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(COMMAND_TYPE_WARP_CURVE_EXACT_INPUT_SINGLE),
      (address)(0), // tokenOut
      (address)(0xDC24316b9AE028F1497c275EB9192a3Ea0f67022), // pool
      (uint8)(1), // i (steth)
      (uint8)(0), // j (eth)
      (uint8)(1), // kind
      (uint8)(0) // underlying
    );

    uint256 expectedSwapOut = 1 ether;
    uint256 expectedFee = 0;

    // NOTE: deal doesn't work for this token, borrow some coins from a whale istead
    vm.prank(0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0);
    Mainnet.STETH.transfer(user, 2 ether);

    vm.prank(user);
    SafeERC20.forceApprove(Mainnet.STETH, address(Addresses.PERMIT2), 2 ether);

    //console2.log('allowance %s', Mainnet.STETH.allowance(user, address(Addresses.PERMIT2)));

    vm.prank(user);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.STETH),
        tokenOut: address(0),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: user,
        partner: address(0),
        feeBps: 0,
        slippageBps: 5,
        deadline: deadline
      }),
      PermitParams({nonce: details.nonce, signature: sig})
    );

    assertApproxEqRel(user.balance, expectedSwapOut - expectedFee, 0.001 ether);
  }

  function testFork_warpCurveDaiToGusd() public {
    uint256 amountIn = 100 * (10 ** 18);
    uint256 amountOut = 99.89 * (10 ** 2);
    address tokenIn = address(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    address tokenOut = address(0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd);

    deal(tokenIn, user, amountIn);

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: tokenIn,
        amount: (uint160)(amountIn),
        expiration: 1694336027,
        nonce: 0
      }),
      address(diamond),
      1694336027
    );

    bytes memory sig = getPermitSignature(permit, privateKey, permit2.DOMAIN_SEPARATOR());

    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(8), // COMMAND_TYPE_WARP_CURVE_EXACT_INPUT_SINGLE
      (address)(0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd), // tokenOut
      (address)(0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956), // pool
      (uint8)(1), // tokenIndexIn
      (uint8)(0), // tokenIndexOut
      (uint8)(1), // kind
      (uint8)(1) // underlying
    );

    vm.prank(user);
    IERC20(tokenIn).approve(address(Addresses.PERMIT2), amountIn);

    vm.prank(user);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        commands: commands,
        amountIn: amountIn,
        amountOut: amountOut,
        recipient: user,
        partner: address(0x0000000000000000000000000000000000000000),
        feeBps: 0,
        slippageBps: 100,
        deadline: 1694336027
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(IERC20(tokenOut).balanceOf(user), amountOut, 'gusd balance');
  }

  function testFork_warpCurveV2Twice() public {
    // NOTE: This test is skipped since it's incompatible with EVM v0.8.19,
    // likely using v0.8.21's PUSH0 opcode
    vm.skip(true);

    deal(0x6B175474E89094C44Da98b954EedeAC495271d0F, user, 100000000000000000000);

    // Log the network
    vm.prank(user);
    IERC20(address(0x6B175474E89094C44Da98b954EedeAC495271d0F)).approve(
      address(Addresses.PERMIT2),
      100000000000000000000
    );

    IAllowanceTransfer.PermitDetails memory details = IAllowanceTransfer.PermitDetails({
      token: 0x6B175474E89094C44Da98b954EedeAC495271d0F,
      amount: (uint160)(100000000000000000000),
      expiration: deadline,
      nonce: 0
    });

    bytes memory sig = getPermitSignature(
      IAllowanceTransfer.PermitSingle(details, address(diamond), deadline),
      privateKey,
      permit2.DOMAIN_SEPARATOR()
    );

    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(2), // Command count
        (uint8)(8), // COMMAND_TYPE_WARP_CURVE_EXACT_INPUT_SINGLE
        (address)(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48), // tokenOut
        (address)(0x5D0F47B32fDd343BfA74cE221808e2abE4A53827), // pool
        (uint8)(1), // tokenIndexIn
        (uint8)(2), // tokenIndexOut
        (uint8)(3), // kind
        (uint8)(1) // underlying
      ),
      abi.encodePacked(
        (uint8)(8), // COMMAND_TYPE_WARP_CURVE_EXACT_INPUT_SINGLE
        (address)(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599), // tokenOut
        (address)(0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B), // pool
        (uint8)(0), // tokenIndexIn
        (uint8)(1), // tokenIndexOut
        (uint8)(3), // kind
        (uint8)(0) // underlying
      )
    );

    vm.prank(user);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(0x6B175474E89094C44Da98b954EedeAC495271d0F),
        tokenOut: address(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599),
        commands: commands,
        amountIn: 100000000000000000000,
        amountOut: 344657,
        recipient: user,
        partner: address(0x0000000000000000000000000000000000000000),
        feeBps: 0,
        slippageBps: 100,
        deadline: 1694337947
      }),
      PermitParams({nonce: details.nonce, signature: sig})
    );

    assertEq(Mainnet.WBTC.balanceOf(user), 344657, 'wbtc balance');
  }

  function testFork_warpCurveV1AndFactory() public {
    deal(user, 1 ether);

    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(2), // Command count
        (uint8)(8), // COMMAND_TYPE_WARP_CURVE_EXACT_INPUT_SINGLE
        (address)(0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84), // tokenOut
        (address)(0xDC24316b9AE028F1497c275EB9192a3Ea0f67022), // pool
        (uint8)(0), // tokenIndexIn
        (uint8)(1), // tokenIndexOut
        (uint8)(2), // kind
        (uint8)(0), // underlying
        (uint8)(8), // COMMAND_TYPE_WARP_CURVE_EXACT_INPUT_SINGLE
        (address)(Mainnet.FRXETH) // tokenOut
      ),
      abi.encodePacked(
        (address)(0x4d9f9D15101EEC665F77210cB999639f760F831E), // pool
        (uint8)(0), // tokenIndexIn
        (uint8)(1), // tokenIndexOut
        (uint8)(2), // kind
        (uint8)(0) // underlying
      )
    );

    vm.prank(user);
    facet.warpLinkEngage{value: 1000000000000000000}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.FRXETH),
        commands: commands,
        amountIn: 1000000000000000000,
        amountOut: 1000867499582465464,
        recipient: user,
        partner: address(0x0000000000000000000000000000000000000000),
        feeBps: 0,
        slippageBps: 100,
        deadline: 1694420123
      }),
      emptyPermitParams
    );

    assertEq(Mainnet.FRXETH.balanceOf(user), 1000867499582465464, 'balance');
  }
}
