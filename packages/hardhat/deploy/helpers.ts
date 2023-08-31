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

export const uniswapV2Router02AddressForNetwork: Partial<Record<string, string>> = {
  mainnet: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  sepolia: '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008',
};

export const uniswapV2FactoryAddressForNetwork: Partial<Record<string, string>> = {
  mainnet: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  sepolia: '0x7E0987E5b3a30e3f2828572Bb659A548460a3003',
};
