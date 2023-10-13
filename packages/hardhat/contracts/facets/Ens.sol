// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC1155Holder} from '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import {IEns} from '../interfaces/IEns.sol';
import {IReverseRegistrar} from '../interfaces/external/ens/IReverseRegistrar.sol';
import {LibDiamond} from '../libraries/LibDiamond.sol';

contract Ens is IEns, ERC1155Holder {
  function ensSetReverseName(address reverseRegistrar, string memory name) external {
    LibDiamond.enforceIsContractOwner();

    IReverseRegistrar(reverseRegistrar).setName(name);
  }
}
