import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { verify } from './helpers';

type SifiDiamondDeployArgs = [owner: string, diamondCutFacetAddress: string];

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { defaultDeployer } = await getNamedAccounts();

  const diamondCutFacet = await deploy('DiamondCutFacet', {
    from: defaultDeployer,
    args: [],
    log: true,
    autoMine: true,
  });

  await verify(diamondCutFacet.address, []);

  const diamondArgs: SifiDiamondDeployArgs = [defaultDeployer, diamondCutFacet.address];

  const sifiDiamond = await deploy('SifiDiamond', {
    from: defaultDeployer,
    args: diamondArgs,
    log: true,
    autoMine: true,
    skipIfAlreadyDeployed: true,
  });

  await verify(sifiDiamond.address, diamondArgs);
};

export default func;

func.tags = ['Diamond', 'SifiDiamond', 'v2', 'deploy'];
