// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/console2.sol';
import 'forge-std/Script.sol';
import {IEns} from 'contracts/interfaces/IEns.sol';

contract EnsSetReverseName is Script {
  address diamondAddr = 0x65c49E9996A877d062085B71E1460fFBe3C4c5Aa;

  function setUp() public {}

  function run() public {
    uint256 privateKey = vm.deriveKey(vm.envString('EVM_MNEMONIC'), 0);
    address user = vm.rememberKey(privateKey);

    console2.log('User: %s', user);
    console2.log('Chain ID: %s', block.chainid);
    console2.log('Block number: %s', block.number);

    vm.startBroadcast(user);

    IEns(diamondAddr).ensSetReverseName(0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb, 'sifi.eth');

    vm.stopBroadcast();
  }
}
