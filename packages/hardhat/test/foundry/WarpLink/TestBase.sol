// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {WarpLink, WarpLinkCommandTypes} from 'contracts/facets/WarpLink.sol';
import {IPermit2} from 'contracts/interfaces/external/IPermit2.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {UniV3Callback} from 'contracts/facets/UniV3Callback.sol';
import {InitLibWarp} from 'contracts/init/InitLibWarp.sol';
import {WarpLinkEncoder} from '../helpers/WarpLinkEncoder.sol';
import {PermitSignature} from '../helpers/PermitSignature.sol';
import {FacetTest} from '../helpers/FacetTest.sol';
import {Addresses} from '../helpers/Networks.sol';

contract WarpLinkTestBase is FacetTest, PermitSignature, WarpLinkCommandTypes {
  event CollectedFee(
    address indexed partner,
    address indexed token,
    uint256 partnerFee,
    uint256 diamondFee
  );

  WarpLink internal facet;
  IPermit2 internal permit2;

  uint256 internal USER_PRIV;
  address internal USER;
  uint48 internal deadline;
  WarpLinkEncoder internal encoder;

  IAllowanceTransfer.PermitSingle internal emptyPermit;
  bytes internal emptyPermitSig;
  PermitParams internal emptyPermitParams;

  function setUpOn(uint256 chainId, uint256 blockNumber) internal override {
    super.setUpOn(chainId, blockNumber);

    encoder = new WarpLinkEncoder();
    deadline = (uint48)(block.timestamp + 1);

    (USER, USER_PRIV) = makeAddrAndKey('User');

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](2);

    facetCuts[0] = IDiamondCut.FacetCut(
      address(new UniV3Callback()),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('UniV3Callback')
    );

    facetCuts[1] = IDiamondCut.FacetCut(
      address(new WarpLink()),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('WarpLink')
    );

    InitLibWarp initLibWarp = new InitLibWarp();

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(initLibWarp),
      abi.encodeWithSelector(
        initLibWarp.init.selector,
        Addresses.weth(chainId),
        Addresses.PERMIT2,
        Addresses.stargateComposer(chainId)
      )
    );

    facet = WarpLink(address(diamond));

    permit2 = IPermit2(Addresses.PERMIT2);

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

    emptyPermitSig = getPermitSignature(emptyPermit, USER_PRIV, permit2.DOMAIN_SEPARATOR());

    emptyPermitParams = PermitParams({nonce: emptyPermit.details.nonce, signature: emptyPermitSig});
  }
}
