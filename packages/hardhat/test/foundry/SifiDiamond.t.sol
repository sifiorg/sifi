// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {DiamondHelpers} from './helpers/DiamondHelpers.sol';
import {SifiDiamond} from 'contracts/SifiDiamond.sol';
import {DiamondCutFacet} from 'contracts/facets/DiamondCutFacet.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {DiamondLoupeFacet} from 'contracts/facets/DiamondLoupeFacet.sol';
import {OwnershipFacet} from 'contracts/facets/OwnershipFacet.sol';
import {LibDiamond} from 'contracts/libraries/LibDiamond.sol';

contract SifiDiamondHarness is SifiDiamond {
  constructor(
    address _contractOwner,
    address _diamondCutFacet
  ) SifiDiamond(_contractOwner, _diamondCutFacet) {}

  function exposed_contractOwner() public view returns (address) {
    return LibDiamond.contractOwner();
  }
}

contract SifiDiamondTest is DiamondHelpers {
  SifiDiamondHarness private diamond;

  function setUp() public {
    diamond = new SifiDiamondHarness(address(this), address(new DiamondCutFacet()));
  }

  function test_contractOwner() public {
    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](0);

    IDiamondCut(address(diamond)).diamondCut(facetCuts, address(0), '');

    assertEq(diamond.exposed_contractOwner(), address(this));
  }
}
