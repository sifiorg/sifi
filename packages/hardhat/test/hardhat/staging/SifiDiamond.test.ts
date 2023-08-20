import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { getNetwork } from '../../../helper-hardhat-config';
import { Deployment } from 'hardhat-deploy/types';
import { OwnershipFacet } from '../../../typechain-types';
import { assert } from 'chai';

describe('SifiDiamond', () => {
  describe('Deployment', () => {
    it('should be deployed and cut on chain', async () => {
      const { get } = deployments;
      const network = getNetwork();
      const { defaultDeployer } = await getNamedAccounts();

      if (network.name === 'mainnet' || network.name === 'sepolia') {
        const diamondDeployment: Deployment = await get('SifiDiamond');
        const ownerShipFacet: OwnershipFacet = await ethers.getContractAt(
          'OwnershipFacet',
          diamondDeployment.address
        );

        const diamondOwner = await ownerShipFacet.owner();

        assert.equal(diamondOwner, defaultDeployer);
      }
    });
  });
});
