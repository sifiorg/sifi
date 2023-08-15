// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import './helpers/TestHelperContract.t.sol';

contract UniswapV2SwapExactETHForTokens is TestHelperContract {
  function setUp() public {}

  function test_SwapEthForUsdc() public {
    address[] memory path = new address[](2);
    path[0] = EEEADDR;
    path[1] = address(USDC);

    deal(address(this), 1 ether);

    sifiRouter.uniswapV2SwapExactETHForTokens{value: 1 ether}(
      1835 * (10 ** 6),
      path,
      payable(this),
      50,
      deadline
    );

    assertApproxEqRel(USDC.balanceOf(address(this)), 1835 * (10 ** 6), 0.05 ether);
  }

  function test_SwapEthForUsdcWithPositiveSlippage() public {
    address[] memory path = new address[](2);
    path[0] = EEEADDR;
    path[1] = address(USDC);

    deal(address(this), 1 ether);

    uint256 feeBalBefore = USDC.balanceOf(address(FEESADDR));

    sifiRouter.uniswapV2SwapExactETHForTokens{value: 1 ether}(
      1830 * (10 ** 6),
      path,
      payable(this),
      50,
      deadline
    );

    uint256 feeBalAfter = USDC.balanceOf(address(FEESADDR));

    assertApproxEqRel(USDC.balanceOf(address(this)), 1835 * (10 ** 6), 0.05 ether);
    assertApproxEqRel(feeBalAfter - feeBalBefore, 160_000, 0.05 ether);
  }
}

contract UniswapV2SwapExactTokensForETH is TestHelperContract {
  function setUp() public {}

  function test_SwapUsdcForEth() public {
    address[] memory path = new address[](2);
    path[0] = address(USDC);
    path[1] = EEEADDR;

    uint256 balBefore = address(this).balance;

    deal(address(USDC), address(this), 2000 * (10 ** 6));

    USDC.approve(address(spender), 2000 * (10 ** 6));

    sifiRouter.uniswapV2SwapExactTokensForETH(
      2000 * (10 ** 6),
      1.09 ether,
      path,
      payable(this),
      50,
      deadline
    );

    uint256 balAfter = address(this).balance;

    assertApproxEqRel(balAfter - balBefore, 1.09 ether, 0.05 ether);
  }

  function test_SwapUsdcForEthWithPositiveSlippage() public {
    address[] memory path = new address[](2);
    path[0] = address(USDC);
    path[1] = EEEADDR;

    uint256 balBefore = address(this).balance;
    uint256 feeBalBefore = address(FEESADDR).balance;

    deal(address(USDC), address(this), 2000 * (10 ** 6));

    USDC.approve(address(spender), 2000 * (10 ** 6));

    sifiRouter.uniswapV2SwapExactTokensForETH(
      2000 * (10 ** 6),
      1.08 ether,
      path,
      payable(this),
      50,
      deadline
    );

    uint256 balAfter = address(this).balance;
    uint256 feeBalAfter = address(FEESADDR).balance;

    assertApproxEqRel(balAfter - balBefore, 1.08 ether, 0.05 ether);
    assertApproxEqRel(feeBalAfter - feeBalBefore, 0.006 ether, 0.05 ether);
  }
}

contract UniswapV2SwapExactTokensForTokens is TestHelperContract {
  function setUp() public {}

  function test_SwapUsdcForDai() public {
    address[] memory path = new address[](2);
    path[0] = address(USDC);
    path[1] = address(DAI);

    deal(address(USDC), address(this), 2000 * (10 ** 6));

    USDC.approve(address(spender), 2000 * (10 ** 6));

    sifiRouter.uniswapV2SwapExactTokensForTokens(
      2000 * (10 ** 6),
      2000 * (10 ** 18),
      path,
      payable(this),
      50,
      deadline
    );

    assertApproxEqRel(DAI.balanceOf(address(this)), 2000 * (10 ** 18), 0.05 ether);
  }

  function test_SwapUsdcForDaiWithPositiveSlippage() public {
    address[] memory path = new address[](2);
    path[0] = address(USDC);
    path[1] = address(DAI);

    deal(address(USDC), address(this), 2000 * (10 ** 6));

    USDC.approve(address(spender), 2000 * (10 ** 6));

    sifiRouter.uniswapV2SwapExactTokensForTokens(
      2000 * (10 ** 6),
      1900 * (10 ** 18),
      path,
      payable(this),
      50,
      deadline
    );

    assertApproxEqRel(DAI.balanceOf(address(this)), 1900 * (10 ** 18), 0.05 ether);
    assertApproxEqRel(DAI.balanceOf(address(FEESADDR)), 90 * (10 ** 18), 0.05 ether);
  }
}
