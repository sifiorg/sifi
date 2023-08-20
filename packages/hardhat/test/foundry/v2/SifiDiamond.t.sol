// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {DiamondHelpers} from './helpers/DiamondHelpers.sol';
import {SifiDiamond} from 'contracts/v2/SifiDiamond.sol';
import {DiamondCutFacet} from 'contracts/v2/facets/DiamondCutFacet.sol';
import {IDiamondCut} from 'contracts/v2/interfaces/IDiamondCut.sol';
import {DiamondLoupeFacet} from 'contracts/v2/facets/DiamondLoupeFacet.sol';
import {OwnershipFacet} from 'contracts/v2/facets/OwnershipFacet.sol';
import {LibDiamond} from 'contracts/v2/libraries/LibDiamond.sol';
import {Mainnet} from './helpers/Mainnet.sol';

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
