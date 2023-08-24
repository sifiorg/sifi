// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {LibDiamond} from './LibDiamond.sol';

library LibKitty {
  using EnumerableSet for EnumerableSet.AddressSet;

  event CollectedFee(
    address indexed partner,
    address indexed token,
    uint256 partnerFee,
    uint256 diamondFee
  );

  struct State {
    /**
     * Set of partner balances. An address is added when the partner is first credited
     */
    EnumerableSet.AddressSet partners;
    /**
     * Set of tokens a partner has ever received fees in. The ETH token address zero is not included.
     * Tokens are not removed from this set when a partner withdraws.
     * Mapping: Partner -> token set
     */
    mapping(address => EnumerableSet.AddressSet) partnerTokens;
    /**
     * Token balances per partner
     * Mapping: Partner -> token -> balance
     */
    mapping(address => mapping(address => uint256)) partnerBalances;
    /**
     * Total balances per token for all partners.
     * Mapping: token -> balance
     */
    mapping(address => uint256) partnerBalancesTotal;
  }

  function state() internal pure returns (State storage s) {
    bytes32 storagePosition = keccak256('diamond.storage.LibKitty');

    assembly {
      s.slot := storagePosition
    }
  }

  /**
   * By using a library function we ensure that the storage used by the library is whichever contract
   * is calling this function
   */
  function registerCollectedFee(
    address partner,
    address token,
    uint256 partnerFee,
    uint256 diamondFee
  ) internal {
    State storage s = state();

    if (token != address(0)) {
      s.partnerTokens[partner].add(token);
    }

    s.partners.add(partner);

    unchecked {
      s.partnerBalances[partner][token] += partnerFee;
      s.partnerBalancesTotal[token] += partnerFee;
    }

    emit CollectedFee(partner, token, partnerFee, diamondFee);
  }
}
