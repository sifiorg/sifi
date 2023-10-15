// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {SifiDiamond} from 'contracts/SifiDiamond.sol';
import {DiamondCutFacet} from 'contracts/facets/DiamondCutFacet.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {DiamondLoupeFacet} from 'contracts/facets/DiamondLoupeFacet.sol';
import {OwnershipFacet} from 'contracts/facets/OwnershipFacet.sol';
import {LibDiamond} from 'contracts/libraries/LibDiamond.sol';
import {IPermit2} from 'contracts/interfaces/external/IPermit2.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {DiamondHelpers} from './DiamondHelpers.sol';
import {Mainnet, Addresses} from './Networks.sol';
import {PermitSignature} from './PermitSignature.sol';

abstract contract FacetTest is DiamondHelpers, PermitSignature {
  SifiDiamond internal diamond;

  // Convenience fields for warps/jumps
  IPermit2 internal permit2;
  uint48 internal deadline;
  uint256 internal privateKey;
  address internal user;
  address internal partner = makeAddr('Partner');
  IAllowanceTransfer.PermitSingle internal emptyPermit;
  bytes internal emptyPermitSig;
  PermitParams internal emptyPermitParams;

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

    (user, privateKey) = makeAddrAndKey('User');
    permit2 = IPermit2(Addresses.PERMIT2);
    deadline = (uint48)(block.timestamp + 60 * 60);

    emptyPermit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(0),
        amount: 0,
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    emptyPermitSig = getPermitSignature(emptyPermit, privateKey, permit2.DOMAIN_SEPARATOR());

    emptyPermitParams = PermitParams({nonce: emptyPermit.details.nonce, signature: emptyPermitSig});
  }
}
