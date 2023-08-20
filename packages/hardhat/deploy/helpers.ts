import { run } from 'hardhat';

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
