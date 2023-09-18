import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

library Mainnet {
  uint256 public constant CHAIN_ID = 1;
  IERC20 public constant WETH = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
  IERC20 public constant USDC = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  IERC20 public constant USDT = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7);
  IERC20 public constant DAI = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
  IERC20 public constant FRXETH = IERC20(0x5E8422345238F34275888049021821E8E08CAa1f);
  IERC20 public constant WBTC = IERC20(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
  IERC20 public constant STETH = IERC20(0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84);
  IERC20 public constant GUSD = IERC20(0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd);
  IERC20 public constant APE = IERC20(0x4d224452801ACEd8B2F0aebE155379bb5D594381);
  address public constant UNISWAP_V2_ROUTER_02_ADDR = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
  address public constant EEE_ADDR = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
  address public constant UNISWAP_V2_FACTORY_ADDR = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
  address public constant SUSHISWAP_V2_FACTORY = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
  address public constant PANCAKESWAP_V2_FACTORY = 0x1097053Fd2ea711dad45caCcc45EfF7548fCB362;
}

library Arbitrum {
  uint256 public constant CHAIN_ID = 42161;
  IERC20 public constant WETH = IERC20(0x82aF49447D8a07e3bd95BD0d56f35241523fBab1);
  IERC20 public constant USDC = IERC20(0xaf88d065e77c8cC2239327C5EDb3A432268e5831);
}

library Polygon {
  uint256 public constant CHAIN_ID = 137;
  IERC20 public constant WMATIC = IERC20(0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270);
  IERC20 public constant USDC = IERC20(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);
}

library Addresses {
  function weth(uint256 chainId) internal pure returns (IERC20) {
    if (chainId == Mainnet.CHAIN_ID) {
      return Mainnet.WETH;
    } else if (chainId == Arbitrum.CHAIN_ID) {
      return Arbitrum.WETH;
    } else if (chainId == Polygon.CHAIN_ID) {
      return Polygon.WMATIC;
    } else {
      revert('Unsupported chain');
    }
  }
}
