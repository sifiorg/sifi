import { getNamedAccounts } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DiamondCutFacet, DiamondLoupeFacet, IDiamondCut } from '../../typechain-types';
import { FacetCutAction } from '../../types/diamond.t';
import { getFunctionSelectorsFromContract, verify } from '../helpers';

/**
 * Initial addition of the loupe facet
 */
const func = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre;
  const { get, deploy } = deployments;
  const { defaultDeployer } = await getNamedAccounts();

  const deployResult = await deploy('DiamondLoupeFacet', {
    from: defaultDeployer,
    args: [],
    log: true,
    autoMine: true,
  });

  await verify(deployResult.address, []);

  const diamondDeployment = await get('SifiDiamond');

  const loupeFacet: DiamondLoupeFacet = await ethers.getContractAt(
    'DiamondLoupeFacet',
    diamondDeployment.address
  );

  try {
    await loupeFacet.facets();

    // Already added to the diamond
    return;
  } catch (error: any) {
    if (!error.message.match(/Function does not exist/)) {
      throw error;
    }
  }

  const diamondCutFacet: DiamondCutFacet = await ethers.getContractAt(
    'DiamondCutFacet',
    diamondDeployment.address
  );

  const cuts: IDiamondCut.FacetCutStruct[] = [
    {
      action: FacetCutAction.Add,
      facetAddress: deployResult.address,
      functionSelectors: getFunctionSelectorsFromContract(loupeFacet),
    },
  ];

  await diamondCutFacet.diamondCut(
    cuts,
    '0x0000000000000000000000000000000000000000',
    Buffer.from([])
  );
};

export default func;

func.tags = ['Diamond', 'Facets', 'v2', 'loupe'];
