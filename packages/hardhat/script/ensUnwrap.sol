// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/console2.sol';
import 'forge-std/Script.sol';
import {IEns} from 'contracts/interfaces/IEns.sol';

contract EnsUnwrap is Script {
  address diamondAddr = 0x65c49E9996A877d062085B71E1460fFBe3C4c5Aa;

  function setUp() public {}

  function run() public {
    uint256 privateKey = vm.deriveKey(vm.envString('EVM_MNEMONIC'), 0);
    address user = vm.rememberKey(privateKey);

    console2.log('User: %s', user);
    console2.log('Chain ID: %s', block.chainid);
    console2.log('Block number: %s', block.number);

    vm.startBroadcast(user);

    IEns(diamondAddr).ensUnwrap(0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401, keccak256('sifi'));

    vm.stopBroadcast();
  }
}
