import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

library Mainnet {
  IERC20 public constant WETH = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
  IERC20 public constant USDC = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  IERC20 public constant DAI = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
  IERC20 public constant WBTC = IERC20(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
  address public constant UNISWAP_V2_ROUTER_02_ADDR = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
  address public constant EEE_ADDR = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
  address public constant UNISWAP_V2_FACTORY_ADDR = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
  address public constant SUSHISWAP_V2_FACTORY = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
}
