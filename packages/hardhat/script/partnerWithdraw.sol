// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Script.sol';
import {IStarVault} from 'contracts/interfaces/IStarVault.sol';

/**
 * Invoke this script using:
 * PRIVATE_KEY=beef forge script script/partnerWithdraw.sol --rpc-url mainnet --sig 'run(address,address)' 0x65c49E9996A877d062085B71E1460fFBe3C4c5Aa 0xdac17f958d2ee523a2206206994597c13d831ec7
 */
contract PartnerWithdrawScript is Script {
  function run(address diamondAddr, address tokenAddr) public {
    uint256 privateKey = vm.envUint('PRIVATE_KEY');
    vm.startBroadcast(privateKey);

    IStarVault(diamondAddr).partnerWithdraw(tokenAddr);

    vm.stopBroadcast();
  }
}
