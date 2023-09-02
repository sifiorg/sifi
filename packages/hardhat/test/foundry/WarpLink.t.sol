// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import 'forge-std/Test.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IUniV2Router} from 'contracts/interfaces/IUniV2Router.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {WarpLink} from 'contracts/facets/WarpLink.sol';
import {LibKitty} from 'contracts/libraries/LibKitty.sol';
import {InitLibWarp} from 'contracts/init/InitLibWarp.sol';
import {IUniswapV2Factory} from 'contracts/interfaces/external/IUniswapV2Factory.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Mainnet} from './helpers/Mainnet.sol';
import {WarpLinkEncoder} from './helpers/WarpLinkEncoder.sol';

contract WarpLinkTestBase is FacetTest {
  event CollectedFee(
    address indexed partner,
    address indexed token,
    uint256 partnerFee,
    uint256 diamondFee
  );

  WarpLink internal facet;
  address internal USER = makeAddr('User');
  uint48 internal deadline;
  WarpLinkEncoder internal encoder;

  function setUpOnMainnetBlockNumber(uint256 blockNumber) public {
    vm.createSelectFork(StdChains.getChain(1).rpcUrl, blockNumber);

    encoder = new WarpLinkEncoder();
    deadline = (uint48)(block.timestamp + 1);

    super.setUp();

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);

    WarpLink kitty = new WarpLink();

    facetCuts[0] = IDiamondCut.FacetCut(
      address(kitty),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('WarpLink')
    );

    InitLibWarp initLibWarp = new InitLibWarp();

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(initLibWarp),
      abi.encodeWithSelector(initLibWarp.init.selector, Mainnet.WETH)
    );

    facet = WarpLink(address(diamond));
  }

  function getPair(
    address factory,
    address tokenA,
    address tokenB
  ) internal view returns (address) {
    if (tokenA > tokenB) {
      (tokenA, tokenB) = (tokenB, tokenA);
    }

    return IUniswapV2Factory(factory).getPair(tokenA, tokenB);
  }
}

contract WarpLinkTest is WarpLinkTestBase {
  function setUp() public override {
    setUpOnMainnetBlockNumber(17853419);
  }

  function testFork_Wrap() public {
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(facet.COMMAND_TYPE_WRAP())
    );

    vm.deal(USER, 1 ether);
    vm.prank(USER);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.WETH),
        commands: commands,
        amountIn: 1 ether,
        amountOut: 1 ether,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );
  }

  function testFork_Unwrap() public {
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(facet.COMMAND_TYPE_UNWRAP())
    );

    vm.prank(USER);
    Mainnet.WETH.approve(address(facet), 1 ether);

    deal(address(Mainnet.WETH), USER, 1 ether);
    vm.prank(USER);

    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(0),
        commands: commands,
        amountIn: 1 ether,
        amountOut: 1 ether,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );
  }

  function testFork_swapSingleUniV2Sushi() public {
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

    vm.prank(USER);
    Mainnet.WETH.approve(address(facet), 1 ether);

    deal(address(Mainnet.WETH), USER, 1 ether);
    vm.prank(USER);

    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );

    assertEq(Mainnet.DAI.balanceOf(USER), expectedSwapOut - expectedFee, 'dai balance after swap');
  }

  function testFork_wrapAndSwapSingleUniV2Sushi() public {
    // Swap ETH to DAI on Sushiswap V2
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(2), // Command count
        (uint8)(facet.COMMAND_TYPE_WRAP())
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

    vm.deal(USER, 1 ether);
    vm.prank(USER);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );

    assertEq(Mainnet.DAI.balanceOf(USER), expectedSwapOut - expectedFee, 'dai balance after swap');
  }

  function testFork_wrapAndSwapSingleUniV2Chained() public {
    // Wrap ETH, swap the WETH to DAI on Sushi and finally the DAI to USDC on Uniswap
    bytes memory commands = abi.encodePacked(
      (uint8)(3), // Command count
      (uint8)(facet.COMMAND_TYPE_WRAP()),
      (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
      (address)(Mainnet.DAI), // WarpUniV2LikeSwapSingleParams.tokenOut
      (address)(getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.WETH), address(Mainnet.DAI))), // WarpUniV2LikeSwapSingleParams.pool
      (uint8)(address(Mainnet.WETH) < address(Mainnet.DAI) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
      (uint16)(30), // WarpUniV2LikeSwapSingleParams.poolFeeBps
      (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
      (address)(Mainnet.USDC), // WarpUniV2LikeSwapSingleParams.tokenOut
      (address)(
        getPair(Mainnet.UNISWAP_V2_FACTORY_ADDR, address(Mainnet.DAI), address(Mainnet.USDC))
      ), // WarpUniV2LikeSwapSingleParams.pool
      (uint8)(address(Mainnet.DAI) < address(Mainnet.USDC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
      (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
    );

    uint256 expectedSwapOut = 1824825184;
    uint256 expectedFee = 0;

    vm.deal(USER, 1 ether);
    vm.prank(USER);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.USDC),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );

    assertEq(
      Mainnet.USDC.balanceOf(USER),
      expectedSwapOut - expectedFee,
      'usdc balance after swap'
    );
  }

  function testFork_splitWrap() public {
    // Split into 3 wraps
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(facet.COMMAND_TYPE_SPLIT()),
      (uint8)(3), // 3 splits
      (uint16)(33_00), // Split 1 has 33%
      (uint8)(1), // Split 1 Command count
      (uint8)(facet.COMMAND_TYPE_WRAP()),
      (uint16)(33_00), // Split 2 has 33%
      (uint8)(1), // Split 3 Command count
      (uint8)(facet.COMMAND_TYPE_WRAP()),
      (uint8)(1), // Split 3 Command count
      (uint8)(facet.COMMAND_TYPE_WRAP()) // Split 3 has remaining %
    );

    uint256 expectedSwapOut = 1 ether;
    uint256 expectedFee = 0;

    vm.deal(USER, 1 ether);
    vm.prank(USER);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.WETH),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );

    assertEq(Mainnet.WETH.balanceOf(USER), expectedSwapOut - expectedFee, 'weth balance after');
  }

  function testFork_wrapSplitSwap() public {
    // Wrap and split into 2 swaps, 70% WETH->WBTC on Uni V2, 30% WETH->WBTC on Sushi V2
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(2), // Command count
        (uint8)(facet.COMMAND_TYPE_WRAP()),
        (uint8)(facet.COMMAND_TYPE_SPLIT()),
        (uint8)(2), // Split count
        (uint16)(70_00), // Split 1: 70%
        (uint8)(1), // Split 1: Command count
        (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          getPair(Mainnet.UNISWAP_V2_FACTORY_ADDR, address(Mainnet.WETH), address(Mainnet.WBTC))
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      ),
      abi.encodePacked(
        (uint8)(1), // Split 2: Command count
        (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.WETH), address(Mainnet.WBTC))
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      )
    );

    uint256 expectedSwapOut = 4_422_050 + 1_891_944;
    uint256 expectedFee = 0;

    vm.deal(USER, 1 ether);
    vm.prank(USER);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.WBTC),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );

    assertEq(Mainnet.WBTC.balanceOf(USER), expectedSwapOut - expectedFee, 'wbtc balance after');
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
        (uint8)(facet.COMMAND_TYPE_WRAP()),
        (uint8)(facet.COMMAND_TYPE_SPLIT()),
        (uint8)(2) // Split count
      ),
      abi.encodePacked(
        (uint16)(70_00), // Split 1: 70%
        (uint8)(1), // Split 1: Command count
        (uint8)(facet.COMMAND_TYPE_SPLIT()),
        (uint8)(2) // Split count
      ),
      abi.encodePacked(
        (uint16)(50_00), // Split 1.1: 50%
        (uint8)(2), // Split 1.1: Command count
        (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
        (address)(Mainnet.USDC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          getPair(Mainnet.UNISWAP_V2_FACTORY_ADDR, address(Mainnet.WETH), address(Mainnet.USDC))
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.USDC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      ),
      abi.encodePacked(
        // Split 1.1 second swap
        (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          getPair(Mainnet.UNISWAP_V2_FACTORY_ADDR, address(Mainnet.USDC), address(Mainnet.WBTC))
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.USDC) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      ),
      abi.encodePacked(
        (uint8)(1), // Split 1.2: Command count
        (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          getPair(Mainnet.UNISWAP_V2_FACTORY_ADDR, address(Mainnet.WETH), address(Mainnet.WBTC))
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      ),
      abi.encodePacked(
        (uint8)(1), // Split 2: Command count
        (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
        (address)(Mainnet.WBTC), // WarpUniV2LikeSwapSingleParams.tokenOut
        (address)(
          getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.WETH), address(Mainnet.WBTC))
        ), // WarpUniV2LikeSwapSingleParams.pool
        (uint8)(address(Mainnet.WETH) < address(Mainnet.WBTC) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
        (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
      )
    );

    uint256 expectedSwapOut = 2168604 + 2211324 + 1891944;
    uint256 expectedFee = 0;

    vm.deal(USER, 1 ether);
    vm.prank(USER);

    facet.warpLinkEngage{value: 1 ether}(
      IWarpLink.Params({
        tokenIn: address(0),
        tokenOut: address(Mainnet.WBTC),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );

    assertEq(Mainnet.WBTC.balanceOf(USER), expectedSwapOut - expectedFee, 'wbtc balance after');
  }

  function testFork_univ2LikeMulti() public {
    // Swap USDC through USDT to APE on Sushi V2
    bytes memory commands = bytes.concat(
      abi.encodePacked(
        (uint8)(1), // Command count
        (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT()),
        (uint8)(2), // Pool count
        (address)(Mainnet.USDT), // token 0
        (address)(Mainnet.APE), // token 1
        (address)(
          getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.USDC), address(Mainnet.USDT))
        ), // pair 0
        (address)(
          getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.USDT), address(Mainnet.APE))
        ), // pair 1
        (uint16)(30), // pool fee bps 0
        (uint16)(30) // pool fee bps 1
      )
    );

    uint256 expectedSwapOut = 247478888382075850448;
    uint256 expectedFee = 0;

    deal(address(Mainnet.USDC), USER, 1000 * (10 ** 6));

    vm.prank(USER);
    Mainnet.USDC.approve(address(facet), 1000 * (10 ** 6));

    vm.prank(USER);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.USDC),
        tokenOut: address(Mainnet.APE),
        commands: commands,
        amountIn: 1000 * (10 ** 6),
        amountOut: 247478888382075850448,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 0,
        deadline: deadline
      })
    );

    assertEq(Mainnet.APE.balanceOf(USER), expectedSwapOut - expectedFee, 'ape balance after');
  }

  function testFork_positiveSlippage() public {
    // Swap WETH to DAI on Sushiswap V2
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
      (address)(Mainnet.DAI), // WarpUniV2LikeSwapSingleParams.tokenOut
      (address)(getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.WETH), address(Mainnet.DAI))), // WarpUniV2LikeSwapSingleParams.pool
      (uint8)(address(Mainnet.WETH) < address(Mainnet.DAI) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
      (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
    );

    uint256 expectedSwapOut = 1828982820960382500646;
    uint256 expectedFee = 0;

    vm.prank(USER);
    Mainnet.WETH.approve(address(facet), 1 ether);

    deal(address(Mainnet.WETH), USER, 1 ether);
    vm.prank(USER);

    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut + 100,
        recipient: USER,
        partner: address(0),
        feeBps: 0,
        slippageBps: 10,
        deadline: deadline
      })
    );

    assertEq(Mainnet.DAI.balanceOf(USER), expectedSwapOut - expectedFee, 'dai balance after swap');
  }

  function testFork_collectFee() public {
    // Swap WETH to DAI on Sushiswap V2
    bytes memory commands = abi.encodePacked(
      (uint8)(1), // Command count
      (uint8)(facet.COMMAND_TYPE_WARP_UNI_V2_LIKE_EXACT_INPUT_SINGLE()),
      (address)(Mainnet.DAI), // WarpUniV2LikeSwapSingleParams.tokenOut
      (address)(getPair(Mainnet.SUSHISWAP_V2_FACTORY, address(Mainnet.WETH), address(Mainnet.DAI))), // WarpUniV2LikeSwapSingleParams.pool
      (uint8)(address(Mainnet.WETH) < address(Mainnet.DAI) ? 1 : 0), // WarpUniV2LikeSwapSingleParams.zeroForOne
      (uint16)(30) // WarpUniV2LikeSwapSingleParams.poolFeeBps
    );

    uint256 expectedSwapOut = 1828982820960382500646;
    uint256 expectedFee = (expectedSwapOut * 15) / 10_000;

    deal(address(Mainnet.WETH), USER, 1 ether);

    vm.prank(USER);
    Mainnet.WETH.approve(address(facet), 1 ether);

    vm.expectEmit(true, true, true, false);
    emit CollectedFee(address(0), address(Mainnet.DAI), 0, expectedFee);

    vm.prank(USER);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: expectedSwapOut,
        recipient: USER,
        partner: address(0),
        feeBps: 15,
        slippageBps: 0,
        deadline: deadline
      })
    );

    assertEq(Mainnet.DAI.balanceOf(USER), expectedSwapOut - expectedFee, 'dai balance after swap');
  }

  function testFork_deadline() public {
    bytes memory commands = abi.encodePacked(
      (uint8)(0) // Command count
    );

    vm.expectRevert(abi.encodeWithSelector(IWarpLink.DeadlineExpired.selector));

    vm.prank(USER);
    facet.warpLinkEngage(
      IWarpLink.Params({
        tokenIn: address(Mainnet.WETH),
        tokenOut: address(Mainnet.DAI),
        commands: commands,
        amountIn: 1 ether,
        amountOut: 1234,
        recipient: USER,
        partner: address(0),
        feeBps: 15,
        slippageBps: 0,
        deadline: (uint48)(deadline - 2)
      })
    );
  }
}

contract WarpLinkBlock18069811Test is WarpLinkTestBase {
  function setUp() public override {
    setUpOnMainnetBlockNumber(18069811);
  }

  function testFork_paraswapVector() public {
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
      abi.encodePacked((uint8)(facet.COMMAND_TYPE_UNWRAP()))
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
      abi.encodePacked((uint8)(facet.COMMAND_TYPE_UNWRAP()))
    );

    // 1: Split 1 will swap APE -> WETH -> Unwrap in two, wrap the ETH,  and then WETH to USDC on Uni V2
    bytes memory commandsSplit1 = bytes.concat(
      abi.encodePacked(
        (uint8)(3), // Command count
        (uint8)(facet.COMMAND_TYPE_SPLIT()),
        (uint8)(2) // Split count
      ),
      commandsSplit1_1,
      commandsSplit1_2,
      abi.encodePacked((uint8)(facet.COMMAND_TYPE_WRAP())),
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
        (uint8)(facet.COMMAND_TYPE_SPLIT()),
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
    Mainnet.APE.approve(address(facet), 1000 ether);

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
      })
    );

    assertEq(Mainnet.USDC.balanceOf(USER), expectedSwapOut - expectedFee, 'usdc balance after');
  }

  receive() external payable {}
}
