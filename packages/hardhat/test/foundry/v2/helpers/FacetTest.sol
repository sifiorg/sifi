// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import 'forge-std/Test.sol';
import {DiamondHelpers} from './DiamondHelpers.sol';
import {SifiDiamond} from 'contracts/v2/SifiDiamond.sol';
import {DiamondCutFacet} from 'contracts/v2/facets/DiamondCutFacet.sol';
import {IDiamondCut} from 'contracts/v2/interfaces/IDiamondCut.sol';
import {DiamondLoupeFacet} from 'contracts/v2/facets/DiamondLoupeFacet.sol';
import {OwnershipFacet} from 'contracts/v2/facets/OwnershipFacet.sol';
import {LibDiamond} from 'contracts/v2/libraries/LibDiamond.sol';
import {Mainnet} from './Mainnet.sol';

abstract contract FacetTest is DiamondHelpers {
  SifiDiamond internal diamond;

  function setUp() public virtual {
    diamond = new SifiDiamond(address(this), address(new DiamondCutFacet()));

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](2);

    facetCuts[0] = IDiamondCut.FacetCut(
      address(new DiamondLoupeFacet()),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('DiamondLoupeFacet')
    );

    facetCuts[1] = IDiamondCut.FacetCut(
      address(new OwnershipFacet()),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('OwnershipFacet')
    );

    IDiamondCut(address(diamond)).diamondCut(facetCuts, address(0), '');
  }
}
