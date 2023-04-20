import { ethers } from 'hardhat';
import { RouterParametersStruct } from '../typechain/contracts/UniversalRouter';
import {
  WETH_ADDRESS,
  BALANCER_ROUTER,
  BANCOR_ROUTER,
  UNI_V2_FACTORY,
  UNI_V3_FACTORY,
  SUSHI_ROUTER,
  PANCAKE_ROUTER,
  SHIBA_ROUTER,
  HYPHEN_BRIDGE,
  CELER_BRIDGE,
  HOP_ETH_BRIDGE,
  HOP_USDC_BRIDGE,
  HOP_USDT_BRIDGE,
  HOP_DAI_BRIDGE,
  HOP_WBTC_BRIDGE,
  HOP_MATIC_BRIDGE,
  ACROSS_BRIDGE,
  MULTICHAIN_ERC20_BRIDGE,
  MULTICHAIN_ETH_BRIDGE,
  SYNAPSE_BRIDGE,
  ALLBRIDGE_BRIDGE,
  PORTAL_BRIDGE,
  OPTIMISM_BRIDGE,
  POLYGON_POS_BRIDGE,
  POLYGON_APPROVE_ADDR,
  OMNI_BRIDGE,
} from '../config';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract with the account: ${deployer.address}`);

  const UniversalRouter = await ethers.getContractFactory('UniversalRouter');
  const routerStruct: RouterParametersStruct = {
    weth: WETH_ADDRESS,
    balancerRouter: BALANCER_ROUTER,
    bancorRouter: BANCOR_ROUTER,
    uniswapV2Factory: UNI_V2_FACTORY,
    uniswapV3Factory: UNI_V3_FACTORY,
    sushiswapRouter: SUSHI_ROUTER,
    pancakeswapRouter: PANCAKE_ROUTER,
    shibaswapRouter: SHIBA_ROUTER,
    hyphenBridge: HYPHEN_BRIDGE,
    celerBridge: CELER_BRIDGE,
    hopEthBridge: HOP_ETH_BRIDGE,
    hopUsdcBridge: HOP_USDC_BRIDGE,
    hopUsdtBridge: HOP_USDT_BRIDGE,
    hopDaiBridge: HOP_DAI_BRIDGE,
    hopWbtcBridge: HOP_WBTC_BRIDGE,
    hopMaticBridge: HOP_MATIC_BRIDGE,
    acrossBridge: ACROSS_BRIDGE,
    multichainErc20Bridge: MULTICHAIN_ERC20_BRIDGE,
    multichainEthBridge: MULTICHAIN_ETH_BRIDGE,
    synapseBridge: SYNAPSE_BRIDGE,
    allBridge: ALLBRIDGE_BRIDGE,
    portalBridge: PORTAL_BRIDGE,
    optimismBridge: OPTIMISM_BRIDGE,
    polygonPosBridge: POLYGON_POS_BRIDGE,
    polygonApproveAddr: POLYGON_APPROVE_ADDR,
    omniBridge: OMNI_BRIDGE,
  };

  const universalRouter = await UniversalRouter.deploy(routerStruct);
  await universalRouter.deployTransaction.wait();
  console.log(`Deployment hash ${universalRouter.deployTransaction.hash}`);

  await universalRouter.deployed();
  console.log(`universalRouter deployed to ${universalRouter.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
