import { HardhatRuntimeEnvironment } from 'hardhat/types';

task('keypair', 'Print deployer keypair').setAction(
  async (taskArgs: undefined, hre: HardhatRuntimeEnvironment) => {
    const network = hre.network.name;

    const mnemonic: string | undefined = (hre.config.networks[network].accounts as any).mnemonic;

    if (!mnemonic) {
      throw new Error(`Mnemonic is unknown for network ${network}`);
    }

    const wallet = hre.ethers.Wallet.fromPhrase(mnemonic);

    console.log(`Network: ${network}`);
    console.log(`Address: ${wallet.address}`);
    console.log(`Private key: ${wallet.privateKey}`);
  }
);
