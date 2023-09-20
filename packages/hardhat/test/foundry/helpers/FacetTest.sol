// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import 'forge-std/Test.sol';
import {DiamondHelpers} from './DiamondHelpers.sol';
import {SifiDiamond} from 'contracts/SifiDiamond.sol';
import {DiamondCutFacet} from 'contracts/facets/DiamondCutFacet.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {DiamondLoupeFacet} from 'contracts/facets/DiamondLoupeFacet.sol';
import {OwnershipFacet} from 'contracts/facets/OwnershipFacet.sol';
import {LibDiamond} from 'contracts/libraries/LibDiamond.sol';
import {Mainnet} from './Networks.sol';

abstract contract FacetTest is DiamondHelpers {
  SifiDiamond internal diamond;

  function setUp() public virtual {
    setUpOn(Mainnet.CHAIN_ID, 17853419);
  }

  function setUpOn(uint256 chainId, uint256 blockNumber) internal virtual {
    vm.createSelectFork(StdChains.getChain(chainId).rpcUrl, blockNumber);

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
