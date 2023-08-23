// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

interface IUniV2RouterFacet {
  function initUniV2Router(address _uniswapV2Router02) external;

  function uniswapV2SwapExactETHForTokens(
    uint256 amountOut,
    address[] memory path,
    address to,
    uint256 slippage,
    uint256 deadline
  ) external payable returns (uint256[] memory amounts);

  function uniswapV2SwapExactTokensForETH(
    uint256 amountIn,
    uint256 amountOut,
    address[] memory path,
    address payable to,
    uint256 slippage,
    uint256 deadline
  ) external returns (uint256[] memory amounts);

  function uniswapV2SwapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOut,
    address[] memory path,
    address to,
    uint256 slippage,
    uint256 deadline
  ) external returns (uint256[] memory amounts);
}
