import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

library Polygon {
  IERC20 public constant WMATIC = IERC20(0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270);
  IERC20 public constant USDC = IERC20(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);
}
