import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { DEV_CHAINS } from '../helper-hardhat-config';
import { network } from 'hardhat';
import verify from '../utils/verify/verify';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get, log } = deployments;

  const { deployerRouter } = await getNamedAccounts();

  const spenderAddress = (await get('Spender')).address;

  const args: unknown[] = [];

  args.push(spenderAddress);
  args.push('0xE9290C80b28db1B3d9853aB1EE60c6630B87F57E'); // Fees
  args.push('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'); // WETH
  args.push('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'); // UniswapV2Router02

  const sifiV1Router01 = await deploy('SifiV1Router01', {
    from: deployerRouter,
    args,
    log: true,
    autoMine: true,
  });

  if (!DEV_CHAINS.includes(network.name)) {
    log('Verifying...');
    await verify(sifiV1Router01.address, args);
  }
};

export default func;

func.tags = ['SifiV1Router01'];
