import { ethers, run } from 'hardhat';
import { DeployOptions, DeployResult } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

export function getFunctionSelectorsFromContract(contract: any): string[] {
  const selectors = Object.values(contract.interface.fragments)
    .filter((fragment: any) => fragment.selector && fragment.type === 'function')
    .map((fragment: any) => fragment.selector);

  return selectors;
}

export async function verify(contactAdress: string, args: unknown[], attempts = 0) {
  try {
    await run('verify:verify', {
      address: contactAdress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.match(/already verified/i)) {
      return;
    }

    if (error.message.match(/does not have bytecode/)) {
      if (attempts > 20) {
        throw error;
      }

      console.error('Waiting for contract to be indexed by Etherscan...');

      await new Promise(resolve => setTimeout(resolve, 30_000));

      await verify(contactAdress, args, attempts + 1);

      return;
    }

    throw error;
  }
}

export async function deploy(
  hre: HardhatRuntimeEnvironment,
  name: string,
  options: DeployOptions
): Promise<Pick<DeployResult, 'address'>> {
  if (process.env.DRY_RUN !== '1') {
    return hre.deployments.deploy(name, options);
  }

  const current = await hre.deployments.getOrNull(name);

  if (!current) {
    console.warn(`No deployment exists for ${name}. Returning zero address for its deployment`);

    return {
      address: ethers.ZeroAddress,
    };
  }

  const fetchIfDifferentResult = await hre.deployments.fetchIfDifferent(name, options);

  if (fetchIfDifferentResult.differences) {
    console.warn(`Deployment for ${name} is different. Returning previous deployment address`);
  } else {
    console.warn(`Deployment for ${name} is unchanged`);
  }

  return hre.deployments.get(name);
}
