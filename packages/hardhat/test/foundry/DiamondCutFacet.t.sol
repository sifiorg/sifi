// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {FacetTest} from './helpers/FacetTest.sol';
import {IDiamondCut} from 'contracts/v2/interfaces/IDiamondCut.sol';
import {DiamondMultiInit} from 'contracts/v2/init/DiamondMultiInit.sol';

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

  function initMultiply(uint256 _product) public {
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

interface ISumFacet {
  function add(uint256 addend) external returns (uint256);

  function sum() external view returns (uint256);
}

contract SumFacet {
  error AlreadyInitialized(uint256 sum);

  struct State {
    uint256 sum;
  }

  function state() internal pure returns (State storage s) {
    bytes32 storagePosition = keccak256('diamond.storage.SumFacet');

    assembly {
      s.slot := storagePosition
    }
  }

  function initSum(uint256 _sum) public {
    State storage sf = state();

    if (sf.sum != 0) {
      revert AlreadyInitialized(sf.sum);
    }

    sf.sum = _sum;
  }

  function add(uint256 addend) external returns (uint256 sum_) {
    State storage sf = state();

    sf.sum += addend;

    return sf.sum;
  }

  function sum() public view returns (uint256) {
    return state().sum;
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
      abi.encodeWithSelector(facet.initMultiply.selector, 2)
    );

    IMultiplyFacet(address(diamond)).multiply(3);

    uint256 product = IMultiplyFacet(address(diamond)).product();
    assertEq(product, 6);
  }

  function test_multiInit() public {
    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](2);

    MultiplyFacet multiplyFacet = new MultiplyFacet();
    SumFacet sumFacet = new SumFacet();

    facetCuts[0] = IDiamondCut.FacetCut(
      address(multiplyFacet),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('MultiplyFacet')
    );

    facetCuts[1] = IDiamondCut.FacetCut(
      address(sumFacet),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('SumFacet')
    );

    DiamondMultiInit multiInit = new DiamondMultiInit();

    address[] memory addresses = new address[](2);
    addresses[0] = address(multiplyFacet);
    addresses[1] = address(sumFacet);

    bytes[] memory data = new bytes[](2);
    data[0] = abi.encodeWithSelector(multiplyFacet.initMultiply.selector, 2);
    data[1] = abi.encodeWithSelector(sumFacet.initSum.selector, 11);

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(multiInit),
      abi.encodeWithSelector(DiamondMultiInit.multiInit.selector, addresses, data)
    );

    IMultiplyFacet(address(diamond)).multiply(3);
    ISumFacet(address(diamond)).add(5);

    uint256 product = IMultiplyFacet(address(diamond)).product();
    assertEq(product, 2 * 3);

    uint256 sum = ISumFacet(address(diamond)).sum();
    assertEq(sum, 11 + 5);
  }
}
