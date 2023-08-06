import { HardhatRuntimeEnvironment } from 'hardhat/types';

task('deploy-SifiV1Router01', 'Deploy SifiV1Router01')
  .addParam('spender', 'Spender address')
  .addParam('fees', 'Fees address')
  .addParam('weth', 'WETH address')
  .addParam('router', 'UniswapV2Router02 address')
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const [deployer] = await hre.ethers.getSigners();

    // TODO: Verify the args

    console.log(`Deploying SifiV1Router01 as ${deployer.address}...`);

    const router = await hre.ethers.deployContract('SifiV1Router01', [
      taskArgs.spender,
      taskArgs.fees,
      taskArgs.weth,
      taskArgs.router,
    ]);

    await router.waitForDeployment();

    console.log(`Deployed SifiV1Router01 to ${router.target}`);

    await hre.run('grantTransferRole', {
      spender: taskArgs.spender,
      target: router.target,
    });
  });
