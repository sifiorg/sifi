import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IWarpLink} from 'contracts/interfaces/IWarpLink.sol';
import {WarpLink} from 'contracts/facets/WarpLink.sol';
import {IUniswapV2Factory} from 'contracts/interfaces/external/IUniswapV2Factory.sol';

contract WarpLinkEncoder {
  IWarpLink public warpLink;

  constructor() {
    warpLink = new WarpLink();
  }

  function getUniswapV2LikePair(
    address factory,
    address tokenA,
    address tokenB
  ) private view returns (address) {
    if (tokenA > tokenB) {
      (tokenA, tokenB) = (tokenB, tokenA);
    }

    return IUniswapV2Factory(factory).getPair(tokenA, tokenB);
  }

  function encodeWarpUniV2LikeExactInputSingle(
    address factory,
    address fromToken,
    address toToken,
    uint16 poolFeeBps
  ) public view returns (bytes memory result) {
    result = abi.encodePacked(
      (uint8)(warpLink.commandTypeWarpUniV2LikeExactInputSingle()),
      (address)(toToken),
      (address)(getUniswapV2LikePair(factory, fromToken, toToken)),
      (uint8)(fromToken < toToken ? 1 : 0),
      (uint16)(poolFeeBps)
    );
  }

  function encodeWarpUniV2LikeExactInput(
    address[] memory tokens,
    address[] memory pools,
    uint16[] memory poolFeesBps
  ) public view returns (bytes memory result) {
    require(tokens.length == pools.length, 'tokens and pools length mismatch');
    require(tokens.length == poolFeesBps.length, 'tokens and poolFeesBps length mismatch');

    result = abi.encodePacked(
      (uint8)(warpLink.commandTypeWarpUniV2LikeExactInput()),
      (uint8)(pools.length)
    );

    // Encode tokens
    for (uint256 index; index < pools.length; index++) {
      result = abi.encodePacked(result, (address)(tokens[index]));
    }

    // Encode pools
    for (uint256 index; index < pools.length; index++) {
      result = abi.encodePacked(result, (address)(pools[index]));
    }

    // Encode pool fees bps
    for (uint256 index; index < pools.length; index++) {
      result = abi.encodePacked(result, (uint16)(poolFeesBps[index]));
    }
  }
}
