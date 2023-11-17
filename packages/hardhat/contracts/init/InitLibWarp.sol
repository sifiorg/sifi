// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IWETH} from '@uniswap/v2-periphery/contracts/interfaces/IWETH.sol';
import {LibWarp} from '../libraries/LibWarp.sol';
import {IPermit2} from '../interfaces/external/IPermit2.sol';
import {IStargateComposer} from '../interfaces/external/IStargateComposer.sol';
import {EnergyShield} from '../EnergyShield.sol';

contract InitLibWarp {
  function init(address weth, address permit2, address stargateComposer) public {
    LibWarp.State storage s = LibWarp.state();

    s.weth = IWETH(weth);
    s.permit2 = IPermit2(permit2);
    s.stargateComposer = IStargateComposer(stargateComposer);

    if (address(s.energyShield) == address(0)) {
      s.energyShield = new EnergyShield();
    }
  }
}
