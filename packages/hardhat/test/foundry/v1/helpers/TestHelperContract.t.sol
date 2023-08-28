// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import 'forge-std/Test.sol';
import 'contracts/v1/Spender.sol';
import 'contracts/v1/SifiV1Router01.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

abstract contract TestHelperContract is Test {
  Spender spender;
  SifiV1Router01 sifiRouter;

  ERC20 constant USDC = ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  ERC20 constant DAI = ERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
  ERC20 constant WETH = ERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
  IUniswapV2Router02 constant IUNIV2ROUTER =
    IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

  uint256 constant AMOUNT = 10000;
  address constant USDCWHALEADDRESS = 0x0162Cd2BA40E23378Bf0FD41f919E1be075f025F;
  address constant FEESADDR = 0x0C4BEf84b07dc0D84ebC414b24cF7Acce24261BA;
  address constant EEEADDR = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

  uint256 deadline;

  constructor() {
    vm.createSelectFork(StdChains.getChain(1).rpcUrl, 17853419);

    spender = new Spender();

    sifiRouter = new SifiV1Router01(
      address(spender),
      payable(FEESADDR),
      address(WETH),
      address(IUNIV2ROUTER)
    );

    spender.grantRole(keccak256('TRANSFER_ROLE'), address(sifiRouter));

    deadline = block.timestamp + 1000;
  }

  receive() external payable {}

  function test_Deployed() public {
    assertTrue(address(spender) != address(0));
    assertTrue(address(sifiRouter) != address(0));
  }
}
