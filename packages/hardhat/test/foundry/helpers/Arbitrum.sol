import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

library Arbitrum {
  IERC20 public constant WETH = IERC20(0x82aF49447D8a07e3bd95BD0d56f35241523fBab1);
  IERC20 public constant USDC = IERC20(0xaf88d065e77c8cC2239327C5EDb3A432268e5831);
}
