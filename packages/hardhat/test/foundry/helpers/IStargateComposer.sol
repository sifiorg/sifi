// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IStargateComposer as IStargateComposerBase} from 'contracts/interfaces/external/IStargateComposer.sol';

interface IStargateComposer is IStargateComposerBase {
  function quoteLayerZeroFee(
    uint16 _dstChainId,
    uint8 _functionType,
    bytes calldata _toAddress,
    bytes calldata _transferAndCallPayload,
    lzTxObj memory _lzTxParams
  ) external view returns (uint256, uint256);
}
