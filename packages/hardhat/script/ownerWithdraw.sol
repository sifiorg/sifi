// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Script.sol';
import {IStarVault} from 'contracts/interfaces/IStarVault.sol';

/**
 * Invoke this script using:
 * PRIVATE_KEY=beef forge script script/ownerWithdraw.sol --rpc-url mainnet --sig 'run(address,address,uint256,address)' <diamond> <token> <amount> <to>
 */
contract OwnerWithdrawScript is Script {
  function run(address diamondAddr, address tokenAddr, uint256 amount, address payable to) public {
    uint256 privateKey = vm.envUint('PRIVATE_KEY');
    vm.startBroadcast(privateKey);

    IStarVault(diamondAddr).ownerWithdraw(tokenAddr, amount, to);

    vm.stopBroadcast();
  }
}
