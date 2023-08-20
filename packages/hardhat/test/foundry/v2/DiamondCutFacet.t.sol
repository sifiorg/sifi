// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {FacetTest} from './helpers/FacetTest.sol';
import {IDiamondCut} from 'contracts/v2/interfaces/IDiamondCut.sol';

interface IMultiplyFacet {
  function multiply(uint256 factor) external returns (uint256);

  function product() external view returns (uint256);
}

contract MultiplyFacet {
  error AlreadyInitialized(uint256 product);

  struct State {
    uint256 product;
  }

  function state() internal pure returns (State storage s) {
    bytes32 storagePosition = keccak256('diamond.storage.MultiplyFacet');

    assembly {
      s.slot := storagePosition
    }
  }

  function init(uint256 _product) public {
    State storage sf = state();

    if (sf.product != 0) {
      revert AlreadyInitialized(sf.product);
    }

    sf.product = _product;
  }

  function multiply(uint256 factor) external returns (uint256 product_) {
    State storage sf = state();

    sf.product *= factor;

    return sf.product;
  }

  function product() public view returns (uint256) {
    return state().product;
  }
}

contract DiamondCutFacetTest is FacetTest {
  function test_addMultiplyFacet() public {
    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);

    MultiplyFacet facet = new MultiplyFacet();

    facetCuts[0] = IDiamondCut.FacetCut(
      address(facet),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('MultiplyFacet')
    );

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(facet),
      abi.encodeWithSelector(facet.init.selector, 2)
    );

    IMultiplyFacet(address(diamond)).multiply(3);

    uint256 product = IMultiplyFacet(address(diamond)).product();
    assertEq(product, 6);
  }
}
