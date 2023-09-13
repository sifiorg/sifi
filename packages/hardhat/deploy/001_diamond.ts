import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { deploy, verify } from './helpers';

type SifiDiamondDeployArgs = [owner: string, diamondCutFacetAddress: string];

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts } = hre;

  const { defaultDeployer } = await getNamedAccounts();

  const diamondCutFacet = await deploy(hre, 'DiamondCutFacet', {
    from: defaultDeployer,
    args: [],
    log: true,
    autoMine: true,
    skipIfAlreadyDeployed: process.env.DRY_RUN === '1',
  });

  await verify(diamondCutFacet.address, []);

  const diamondArgs: SifiDiamondDeployArgs = [defaultDeployer, diamondCutFacet.address];

  const sifiDiamond = await deploy(hre, 'SifiDiamond', {
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
