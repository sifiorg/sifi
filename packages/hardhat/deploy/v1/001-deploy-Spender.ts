import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { verify } from '../helpers';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployerSpender } = await getNamedAccounts();

  const args: unknown[] = [];

  const spender = await deploy('Spender', {
    from: deployerSpender,
    args,
    log: true,
    autoMine: true,
  });

  await verify(spender.address, args);
};

export default func;

func.tags = ['Spender', 'v1'];
