// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/console2.sol';
import 'forge-std/Script.sol';
import {IEns} from 'contracts/interfaces/IEns.sol';

contract EnsApprove is Script {
  address diamondAddr = 0x65c49E9996A877d062085B71E1460fFBe3C4c5Aa;

  function setUp() public {}

  function run() public {
    uint256 privateKey = vm.deriveKey(vm.envString('EVM_MNEMONIC'), 0);
    address user = vm.rememberKey(privateKey);

    console2.log('User: %s', user);
    console2.log('Chain ID: %s', block.chainid);
    console2.log('Block number: %s', block.number);

    vm.startBroadcast(user);

    IEns(diamondAddr).ensApprove(
      0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85,
      user,
      0x7d7eddb37a9ea919d38198c8ed37bdc520acc98255d61b957bce3207f0d4e746
    );

    vm.stopBroadcast();
  }
}
