import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { DEV_CHAINS } from '../helper-hardhat-config';
import { network } from 'hardhat';
import verify from '../utils/verify/verify';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;

  const { deployerSpender } = await getNamedAccounts();

  const args: unknown[] = [];

  const spender = await deploy('Spender', {
    from: deployerSpender,
    args,
    log: true,
    autoMine: true,
  });

  if (!DEV_CHAINS.includes(network.name)) {
    log('Verifying...');
    await verify(spender.address, args);
  }
};

export default func;

func.tags = ['Spender'];
