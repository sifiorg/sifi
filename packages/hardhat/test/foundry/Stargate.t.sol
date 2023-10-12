// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {FacetTest} from './helpers/FacetTest.sol';
import {Addresses, Mainnet, Polygon, Optimism} from './helpers/Networks.sol';
import {IDiamondCut} from 'contracts/interfaces/IDiamondCut.sol';
import {IStargate} from 'contracts/interfaces/IStargate.sol';
import {Stargate} from 'contracts/facets/Stargate.sol';
import {InitLibWarp} from 'contracts/init/InitLibWarp.sol';
import {IPermit2} from 'contracts/interfaces/external/IPermit2.sol';
import {PermitSignature} from './helpers/PermitSignature.sol';
import {IAllowanceTransfer} from 'contracts/interfaces/external/IAllowanceTransfer.sol';
import {PermitParams} from 'contracts/libraries/PermitParams.sol';
import {IStargateRouter} from 'contracts/interfaces/external/IStargateRouter.sol';
import {IStargateComposer} from './helpers/IStargateComposer.sol';

abstract contract StargateTestBase is FacetTest, PermitSignature {
  IStargate internal facet;
  IPermit2 internal permit2;
  uint48 internal deadline;
  uint256 USER_PRIV;
  address USER;
  address PARTNER = makeAddr('Partner');

  function setUpOn(uint256 chainId, uint256 blockNumber) internal override {
    super.setUpOn(chainId, blockNumber);

    (USER, USER_PRIV) = makeAddrAndKey('User');

    IDiamondCut.FacetCut[] memory facetCuts = new IDiamondCut.FacetCut[](1);

    facetCuts[0] = IDiamondCut.FacetCut(
      address(new Stargate()),
      IDiamondCut.FacetCutAction.Add,
      generateSelectors('Stargate')
    );

    IDiamondCut(address(diamond)).diamondCut(
      facetCuts,
      address(new InitLibWarp()),
      abi.encodeWithSelector(
        InitLibWarp.init.selector,
        Addresses.weth(chainId),
        Addresses.PERMIT2,
        Addresses.stargateComposer(chainId)
      )
    );

    facet = IStargate(address(diamond));

    permit2 = IPermit2(Addresses.PERMIT2);

    deadline = (uint48)(block.timestamp + 1000);
  }
}

contract StargateMainnetTest is StargateTestBase {
  function setUp() public override {
    // NOTE: This is the same block number as the WarpLink Stargate tests

    super.setUpOn(1, 18331782);
  }

  function testFork_stargateJumpTokens_Usdc() public {
    deal(address(Mainnet.USDC), USER, 1000 * (10 ** 6));

    (uint256 lzFee, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: Optimism.STARGATE_CHAIN_ID,
      _functionType: 1, // swap remote
      _toAddress: abi.encodePacked(USER),
      _transferAndCallPayload: '',
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    deal(USER, lzFee);

    vm.prank(USER);
    Mainnet.USDC.approve(address(Addresses.PERMIT2), 1000 * (10 ** 6));

    IAllowanceTransfer.PermitSingle memory permit = IAllowanceTransfer.PermitSingle(
      IAllowanceTransfer.PermitDetails({
        token: address(Mainnet.USDC),
        amount: 1000 * (10 ** 6),
        expiration: deadline,
        nonce: 0
      }),
      address(diamond),
      deadline
    );

    bytes memory sig = getPermitSignature(permit, USER_PRIV, permit2.DOMAIN_SEPARATOR());

    vm.prank(USER);
    facet.stargateJumpToken{value: lzFee}(
      IStargate.JumpTokenParams({
        amountIn: 1000 * (10 ** 6),
        // TODO: Estimate using contracts
        amountOutExpected: 1000 * (10 ** 6),
        recipient: USER,
        slippageBps: 50,
        feeBps: 15,
        deadline: deadline,
        partner: address(0),
        token: address(Mainnet.USDC),
        srcPoolId: 1,
        dstPoolId: 1,
        dstChainId: Optimism.STARGATE_CHAIN_ID
      }),
      PermitParams({nonce: permit.details.nonce, signature: sig})
    );

    assertEq(Mainnet.USDC.balanceOf(USER), 0);
  }

  function testFork_stargateJumpNative() public {
    (uint256 lzFee, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: Optimism.STARGATE_CHAIN_ID,
      _functionType: 1, // swap remote
      _toAddress: abi.encodePacked(USER),
      _transferAndCallPayload: '',
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    uint160 amountIn = 1 ether;
    deal(USER, amountIn + lzFee);

    vm.prank(USER);
    facet.stargateJumpNative{value: amountIn + lzFee}(
      IStargate.JumpNativeParams({
        amountIn: amountIn,
        // TODO: Estimate using contracts
        amountOutExpected: amountIn,
        recipient: USER,
        slippageBps: 50,
        feeBps: 15,
        deadline: deadline,
        partner: address(0),
        srcPoolId: 13,
        dstPoolId: 13,
        dstChainId: Optimism.STARGATE_CHAIN_ID
      })
    );
  }

  function testFork_stargateJumpNative_zeroExpected() public {
    (uint256 lzFee, ) = IStargateComposer(Mainnet.STARGATE_COMPOSER_ADDR).quoteLayerZeroFee({
      _dstChainId: Optimism.STARGATE_CHAIN_ID,
      _functionType: 1, // swap remote
      _toAddress: abi.encodePacked(USER),
      _transferAndCallPayload: '',
      _lzTxParams: IStargateRouter.lzTxObj({
        dstGasForCall: 0,
        dstNativeAmount: 0,
        dstNativeAddr: ''
      })
    });

    uint160 amountIn = 1 ether;
    deal(USER, amountIn + lzFee);

    vm.prank(USER);
    facet.stargateJumpNative{value: amountIn + lzFee}(
      IStargate.JumpNativeParams({
        amountIn: amountIn,
        // TODO: Estimate using contracts
        amountOutExpected: 0,
        recipient: USER,
        slippageBps: 50,
        feeBps: 15,
        deadline: deadline,
        partner: address(0),
        srcPoolId: 13,
        dstPoolId: 13,
        dstChainId: Optimism.STARGATE_CHAIN_ID
      })
    );
  }
}
