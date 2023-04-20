import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { Contract } from 'ethers';
import '@nomiclabs/hardhat-ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { UniversalRouter, UniversalRouter__factory } from '../typechain';

import { RouterParametersStruct } from '../typechain/contracts/UniversalRouter';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

////////////////////////////////// ROUTER_CONSTANTS ////////////////////////////////
const swapAccount = '0x4cbeECcb5e8008a5cdA95bD1Bb92948bDA5E466b';
const multiSigAccount = '0xE9290C80b28db1B3d9853aB1EE60c6630B87F57E';
const UNI_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const UNI_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const SUSHI_ROUTER = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
const CURVE_ROUTER = '0x81C46fECa27B31F3ADC2b91eE4be9717d1cd3DD7';
const CURVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const BALANCER_ROUTER = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
const KYBER_ROUTER = '0xC1e7dFE73E1598E3910EF4C7845B68A9Ab6F4c83';
const BANCOR_ROUTER = '0xeEF417e1D5CC832e619ae18D2F140De2999dD4fB';
const PANCAKE_ROUTER = '0xEfF92A263d31888d860bD50809A8D171709b7b1c';
const PARASWAP_ROUTER = '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57';
const DODO_ROUTER = '0xa356867fDCEa8e71AEaF87805808803806231FdC';
const CRO_ROUTER = '0xCeB90E4C17d626BE0fACd78b79c9c87d7ca181b3';
const SHIBA_ROUTER = '0x03f7724180AA6b939894B5Ca4314783B0b36b329';

////////////////////////////////// BRIDGE CONSTANTS ////////////////////////////////
const HYPHEN_BRIDGE = '0x2A5c2568b10A0E826BfA892Cf21BA7218310180b';
const CELER_BRIDGE = '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820';
const ACROSS_BRIDGE = '0x4D9079Bb4165aeb4084c526a32695dCfd2F77381';
const HOP_ETH_BRIDGE = '0xb8901acB165ed027E32754E0FFe830802919727f';
const HOP_USDC_BRIDGE = '0x3666f603cc164936c1b87e207f36beba4ac5f18a';
const HOP_USDT_BRIDGE = '0x3E4a3a4796d16c0Cd582C382691998f7c06420B6';
const HOP_DAI_BRIDGE = '0x3d4Cc8A61c7528Fd86C55cfe061a78dCBA48EDd1';
const HOP_WBTC_BRIDGE = '0xb98454270065A31D71Bf635F6F7Ee6A518dFb849';
const HOP_MATIC_BRIDGE = '0x22B1Cbb8D98a01a3B71D034BB899775A76Eb1cc2';
const MULTICHAIN_ETH_BRIDGE = '0xBa8Da9dcF11B50B03fd5284f164Ef5cdEF910705';
const MULTICHAIN_ERC20_BRIDGE = '0x7782046601e7b9B05cA55A3899780CE6EE6B8B2B';
const STARGATE_ETH_BRIDGE = '0x150f94B44927F078737562f0fcF3C95c01Cc2376';
const STARGATE_ERC20_BRIDGE = '0x8731d54E9D02c286767d56ac03e8037C07e01e98';
const OPTIMISM_BRIDGE = '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1';
const ARBITRUM_ONE_ETHBRIDGE = '0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f';
const ARBITRUM_ONE_APPROVEPROXY = '0xd92023E9d9911199a6711321D1277285e6d4e2db';
const ARBITRUM_ONE_ERC20BRIDGE = '0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef'; // 0xcEe284F754E854890e311e3280b767F80797180d
const ARBITRUM_NOVA_BRIDGE = '0xc4448b71118c9071Bcb9734A0EAc55D18A153949';
const ARBITRUM_NOVA_APPROVEPROXY = '0xE4E2121b479017955Be0b175305B35f312330BaE';
const ARBITRUM_NOVA_ERC20BRIDGE = '0xC840838Bc438d73C16c2f8b22D2Ce3669963cD48';
const AVALANCHE_BRIDGE = '0x8EB8a3b98659Cce290402893d0123abb75E3ab28';
const ALLBRIDGE_BRIDGE = '0xBBbD1BbB4f9b936C3604906D7592A644071dE884';
const ALLBRIDGE_STABLE_BRIDGE = '0xB827b15adA62D78F5cb90243bc4755cf4B9d1B0e'; // Solana and BNB
const PORTAL_BRIDGE = '0x3ee18B2214AFF97000D974cf647E7C347E8fa585';
const SYNAPSE_BRIDGE = '0x6571d6be3d8460CF5F7d6711Cd9961860029D85F';
const CONNEXT_BRIDGE = '0x31eFc4AeAA7c39e54A33FDc3C46ee2Bd70ae0A09';
const POLYGON_POS_BRIDGE = '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77';
const POLYGON_PREDICATE = '0x158d5fa3Ef8e4dDA8a5367deCF76b94E7efFCe95';
const POLYGON_APPROVE_ADDR = '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf'; // Used for ERC20 Tx's
const OMNI_BRIDGE = '0x88ad09518695c6c3712AC10a214bE5109a655671';
const PERMIT_2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

////////////////////////////////// FACTORY CONSTANTS ////////////////////////////////
const DODO_APPROVE_PROXY = '0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149';
const UNI_V2_FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const UNI_V3_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

////////////////////////////////// ERC20 CONSTANTS ////////////////////////////////
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const BNT_ADDRESS = '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C';
const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const WBTC_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
const BAL_ADDRESS = '0xba100000625a3754423978a60c9317c58a424e3D';
const stETH_ADDRESS = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
const ITUS_ADDRESS = '0x7F8D793C60e60ca92566696C772562288D9d0279';
const WAR_ADDRESS = '0x4FaDC7A98f2Dc96510e42dD1A74141eEae0C1543';
const FNK_ADDRESS = '0xb5fe099475d3030dde498c3bb6f3854f762a48ad';
const HEZ_ADDRESS = '0xeef9f339514298c6a857efcfc1a762af84438dee';
const ANY_USDC_ADDRESS = '0x7EA2be2df7BA6E54B1A9C70676f668455E329d29';
const ANY_ETH_ADDRESS = '0x0615Dbba33Fe61a31c7eD131BDA6655Ed76748B1';
const SUSD_ADDRESS = '0x57ab1ec28d129707052df4df418d58a2d46d5f51';
const FXS_ADDRESS = '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0';
const STG_ADDRESS = '0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6';
const AURA_ADDRESS = '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF';
const BADGERDAO_ADDRESS = '0xBA485b556399123261a5F9c95d413B4f93107407';
const BTRFLY_ADDRESS = '0xc55126051B22eBb829D00368f4B12Bde432de5Da';
const OHM_ADDRESS = '0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5';
const OPTIMISM_USDC_ADDRESS = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607';
const MIM_ADDRESS = '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3';

////////////////////////////////// ABI CONSTANTS ////////////////////////////////
const ERC20_ABI = [
  'function balanceOf(address) public view returns (uint256)',
  'function transfer(address, uint256) public returns (bool)',
  'function approve(address, uint256) public returns (bool)',
  'function allowance(address, address) public view returns (uint256)',
  'function nonces(address) public view returns (uint256)',
  'function name() public view returns (string)',
  'function permit(address, address, uint256, uint256, uint8, bytes32, bytes32) public',
  'function permitDAI(address, address, uint256, uint256, bool, uint8, bytes32, bytes32) public',
];

const ROUTER_INTERFACE = [
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external payable returns (uint256[] memory amounts)',
  'function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)',
  'function exactInputSingle(tuple(address, address, uint24, address, uint256, uint256, uint256, uint160)) returns(uint256)',
  'function tradeBySourceAmount(address, address, uint256, uint256, uint256, address) returns(uint256)',
  'function swap((bytes32,uint8,address,address,uint256,bytes),(address,bool,address,bool), uint256, uint256) returns (uint256)',
  'function exchange(int128, int128, uint256, uint256) returns (uint256)',
  'function exchange_underlying(int128, int128, uint256, uint256) returns (uint256)',
  'function batchSwap(uint8, (bytes32,uint256,uint256,uint256,bytes)[], address[], (address,bool,address,bool), int256[], uint256)',
];

const CURVE_CRYPTO_INTERFACE = [
  'function exchange(uint256, uint256, uint256, uint256, bool) returns (uint256)',
];

////////////////////////////////// BYTES CONSTANTS ////////////////////////////////
const addressPadding = '000000000000000000000000';

////////////////////////////// ROUTER TESTS //////////////////////////////
describe('Testing Mainnet Router', () => {
  async function deployRouter() {
    const impersonateAccount = '0x4cbeECcb5e8008a5cdA95bD1Bb92948bDA5E466b';
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [impersonateAccount],
    });
    const signer = await hre.ethers.getSigner(impersonateAccount);

    const UniversalRouter = (await hre.ethers.getContractFactory(
      'UniversalRouter'
    )) as UniversalRouter__factory;
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
    await universalRouter.deployed();

    return {
      signer,
      impersonateAccount,
      universalRouter,
    };
  }

  async function sendFundsToAccount(
    senderAccount: string,
    accountToFund: string,
    erc20Address: string,
    amount: string
  ) {
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [senderAccount],
    });
    const signer = await hre.ethers.getSigner(senderAccount);
    const ERC20_CONTRACT = new hre.ethers.Contract(erc20Address, ERC20_ABI, signer);
    await ERC20_CONTRACT.connect(signer).transfer(accountToFund, amount);
    const accountBalance = await ERC20_CONTRACT.balanceOf(accountToFund);
    expect(accountBalance.toString()).to.equal(amount);
  }

  async function sendETHToAccount(senderAccount: string, accountToFund: string, amount: string) {
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [senderAccount],
    });
    const signer = await hre.ethers.getSigner(senderAccount);
    const startingBalance = await hre.ethers.provider.getBalance(accountToFund);
    await signer.sendTransaction({ to: accountToFund, value: amount });
    const accountBalance = await hre.ethers.provider.getBalance(accountToFund);
    expect(accountBalance.toString()).to.equal(startingBalance.add(amount).toString());
  }

  async function getNewSigner(signer: any) {
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [signer],
    });
    const newSigner = await hre.ethers.getSigner(signer.toString());
    return newSigner;
  }

  async function createERC20Contracts(signer: any, token0Address: any, token1Address: any) {
    if (token0Address != 0) {
      token0Contract = new hre.ethers.Contract(token0Address, ERC20_ABI, signer);
    }
    if (token1Address != 0) {
      token1Contract = new hre.ethers.Contract(token1Address, ERC20_ABI, signer);
    }
    return { token0Contract, token1Contract };
  }

  async function getBalances(signer: any, token0Contract: any, token1Contract: any) {
    let token0Balance, token1Balance;
    if (token0Contract == 0) {
      token0Balance = await hre.ethers.provider.getBalance(signer.address);
    } else {
      token0Balance = await token0Contract.balanceOf(signer.address);
    }
    if (token1Contract == 0) {
      token1Balance = await hre.ethers.provider.getBalance(signer.address);
    } else {
      token1Balance = await token1Contract.balanceOf(signer.address);
    }
    return { token0Balance, token1Balance };
  }

  async function approveERC20(
    signer: SignerWithAddress,
    token0Contract: Contract,
    router: any,
    amountIn: string
  ) {
    const approveTx = await token0Contract
      .connect(signer)
      .approve(router.address, amountIn, { gasLimit: 1000000 });
    const approveReceipt = await approveTx.wait();
    approveTxCost = approveReceipt.cumulativeGasUsed.mul(approveReceipt.effectiveGasPrice);
    return { approveTxCost };
  }

  async function checkBalanceChange(
    signer: any,
    amountIn: string,
    amountOutMin: string,
    txCost: string,
    approveTxCost: string,
    token0Balance: any,
    token1Balance: any,
    token0Contract: any,
    token1Contract: any,
    route: any
  ) {
    if (route === 'fromETH') {
      const token0BalanceAfter = await hre.ethers.provider.getBalance(signer.address);
      expect(Number(token0BalanceAfter)).to.be.greaterThanOrEqual(
        Number(token0Balance.sub(amountIn).sub(txCost))
      );
    } else {
      const token0BalanceAfter = await token0Contract.balanceOf(signer.address);
      expect(Number(token0BalanceAfter)).to.be.greaterThanOrEqual(
        Number(token0Balance.sub(amountIn))
      );
    }
    if (route === 'toETH') {
      const token0BalanceAfter = await hre.ethers.provider.getBalance(signer.address);
      expect(Number(token0BalanceAfter)).to.be.greaterThanOrEqual(
        Number(token1Balance.sub(approveTxCost).sub(txCost).add(amountOutMin))
      );
    } else {
      const token1BalanceAfter = await token1Contract.balanceOf(signer.address);
      expect(Number(token1BalanceAfter)).to.be.greaterThan(
        Number(token1Balance.add(Number(amountOutMin)))
      );
    }
  }

  async function checkBridgeChange(
    signer: any,
    amountIn: string,
    txCost: string,
    approveTxCost: string,
    token0Balance: any,
    token0Contract: any,
    route: any
  ) {
    if (route === 'fromETH') {
      const token0BalanceAfter = await hre.ethers.provider.getBalance(signer.address);
      expect(Number(token0BalanceAfter)).to.be.greaterThanOrEqual(
        Number(token0Balance.sub(amountIn).sub(txCost))
      );
    } else {
      const token0BalanceAfter = await token0Contract.balanceOf(signer.address);
      expect(Number(token0BalanceAfter)).to.be.greaterThanOrEqual(
        Number(token0Balance.sub(amountIn))
      );
    }
  }

  async function getTxCost(transaction: any) {
    const txReceipt = await transaction.wait();
    const txCost = txReceipt.cumulativeGasUsed.mul(txReceipt.effectiveGasPrice).toString();
    return { txCost };
  }

  async function checkFeeCharge(
    token0Contract: Contract,
    token0BalanceBefore: any,
    amountIn: number,
    fee: number,
    router: any
  ) {
    const balanceAfter = await token0Contract.balanceOf(router.address);
    const feeCharged = amountIn - (amountIn * fee) / 10000;
    expect(balanceAfter).to.equal(token0BalanceBefore.add(feeCharged));
  }

  async function getCurveData(srcToken: string, addresses: string[], swapPools: string[]) {
    const path = [];
    const pools = [];
    path.push(srcToken);
    for (let i = 0; i < 4; i++) {
      pools.push(hre.ethers.constants.AddressZero);
    }
    for (let i = 0; i < 4; i++) {
      if (swapPools[i] != undefined) {
        path.push(swapPools[i]);
        path.push(addresses[i]);
      } else {
        path.push(hre.ethers.constants.AddressZero);
        path.push(hre.ethers.constants.AddressZero);
      }
    }
    return { path, pools };
  }

  let signer: any, impersonateAccount: string, universalRouter: UniversalRouter;
  describe('Deployment', function () {
    before(async function () {
      ({ signer, impersonateAccount, universalRouter } = await loadFixture(deployRouter));
    });

    it('Should have correct fee', async function () {
      expect(universalRouter.address).to.not.be.undefined;
    });
  });

  describe('Top up account', function () {
    it('Should top up USDC', async function () {
      const sender = '0x5c9e5ee55fae482f52e4dbb1959f941b4cdcc7b2';
      const topupAmount = '100000000000';
      await sendFundsToAccount(sender, swapAccount, USDC_ADDRESS, topupAmount);
    });

    it('Should top up USDT', async function () {
      const sender = '0xee5b5b923ffce93a870b3104b7ca09c3db80047a';
      const topupAmount = '100000000000';
      await sendFundsToAccount(sender, swapAccount, USDT_ADDRESS, topupAmount);
    });

    it('Should top up DAI', async function () {
      const sender = '0x904E46121D2420038fA990fff3fd16ba3624aa1D';
      const topupAmount = '1000000000000000000000';
      await sendFundsToAccount(sender, swapAccount, DAI_ADDRESS, topupAmount);
    });

    it('Should top up WAR', async function () {
      const sender = '0xaad5435cffaad3c7bc8ec98a474fb014606817c0';
      const topupAmount = '100000000000';
      await sendFundsToAccount(sender, swapAccount, WAR_ADDRESS, topupAmount);
    });

    it('Should top up FXS', async function () {
      const sender = '0xF6853c77a2452576EaE5af424975a101FfC47308';
      const topupAmount = '100000000000000000000';
      await sendFundsToAccount(sender, swapAccount, FXS_ADDRESS, topupAmount);
    });

    it('Should top up ETH', async function () {
      const sender = '0x5c9e5ee55fae482f52e4dbb1959f941b4cdcc7b2';
      const topupAmount = '100000000000000000000';
      await sendETHToAccount(sender, swapAccount, topupAmount);
    });

    it('Should top up ETH', async function () {
      const sender = '0x5c9e5ee55fae482f52e4dbb1959f941b4cdcc7b2';
      const topupAmount = '100000000000000000000';
      await sendETHToAccount(sender, multiSigAccount, topupAmount);
    });
  });

  let token0Contract: Contract,
    token1Contract: Contract,
    token0Balance,
    token1Balance,
    txCost: string,
    approveTxCost: string,
    amountIn,
    amountOutMin,
    minETH: string,
    pair: string,
    iface: any;
  const deadline = hre.ethers.constants.MaxUint256;
  iface = new hre.ethers.utils.Interface(ROUTER_INTERFACE);
  describe('Swaps token to token', function () {
    it('Should swap USDC to WETH on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WETH_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '10000000';
      amountOutMin = '10000000000000';

      ({ approveTxCost } = await approveERC20(signer, token0Contract, universalRouter, amountIn));

      const command = '0x014000';
      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDC_ADDRESS.slice(2) + WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      await universalRouter.connect(signer).singleExecute(command, inputs);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDC to WETH to USDT on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '10000000';
      amountOutMin = '2000000';

      ({ approveTxCost } = await approveERC20(signer, token0Contract, universalRouter, amountIn));

      const command = '0x014000';
      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDC_ADDRESS.slice(2) + WETH_ADDRESS.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + data + '02' + '00';

      await universalRouter.connect(signer).singleExecute(command, inputs, { gasLimit: 1000000 });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDC to WETH to WBTC to USDT on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '10000000';
      amountOutMin = '2000000';

      ({ approveTxCost } = await approveERC20(signer, token0Contract, universalRouter, amountIn));

      const command = '0x014000';
      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data =
        USDC_ADDRESS.slice(2) +
        WETH_ADDRESS.slice(2) +
        WBTC_ADDRESS.slice(2) +
        USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + data + '03' + '00';

      await universalRouter.connect(signer).singleExecute(command, inputs, { gasLimit: 1000000 });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap WETH to USDC on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const command = '0x024000'; // Addr: TBD, Amount: TBD

      amountIn = '100000000000000';
      amountOutMin = '100000';

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const fee = 500;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = WETH_ADDRESS.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + pathData + '01' + '00';

      await universalRouter.connect(signer).singleExecute(command, inputs, { gasLimit: 1000000 });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDC to WETH to USDT on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const command = '0x024000';

      amountIn = '10000000';
      amountOutMin = '1000000';

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const fee0 = 500;
      const fee1 = 3000;

      const encodedFee0 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee0), 3).slice(2);
      const encodedFee1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee1), 3).slice(2);
      const pathData =
        USDC_ADDRESS.slice(2) +
        encodedFee0 +
        WETH_ADDRESS.slice(2) +
        encodedFee1 +
        USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + pathData + '02' + '00';

      await universalRouter.connect(signer).singleExecute(command, inputs, { gasLimit: 1000000 });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDC to USDT to WETH to WBTC on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WBTC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const command = '0x024000'; // Addr: c0, Amount: 00

      amountIn = '10000000';
      amountOutMin = '10000';

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const fee0 = 100;
      const fee1 = 500;
      const fee2 = 3000;
      const encodedFee0 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee0), 3).slice(2);
      const encodedFee1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee1), 3).slice(2);
      const encodedFee2 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee2), 3).slice(2);
      const pathData =
        USDC_ADDRESS.slice(2) +
        encodedFee0 +
        USDT_ADDRESS.slice(2) +
        encodedFee1 +
        WETH_ADDRESS.slice(2) +
        encodedFee2 +
        WBTC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + pathData + '03' + '00';

      await universalRouter.connect(signer).singleExecute(command, inputs, { gasLimit: 1000000 });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDC to WETH on Sushi Fork', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WETH_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '10000000';
      amountOutMin = '10000000000000';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDC_ADDRESS, WETH_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '00';
      await universalRouter.connect(signer).singleExecute(command, bytesData);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDC to WETH to USDT on Sushi Fork', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100000000';
      amountOutMin = '10000000';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDC_ADDRESS, WETH_ADDRESS, USDT_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '00';
      await universalRouter.connect(signer).singleExecute(command, bytesData);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap WETH to USDT on Pancake', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '1000000000000000';
      amountOutMin = '1000000';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [WETH_ADDRESS, USDT_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '01';
      await universalRouter.connect(signer).singleExecute(command, bytesData);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDC to WETH to USDT on Pancake', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100000000';
      amountOutMin = '1000000';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDC_ADDRESS, WETH_ADDRESS, USDT_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '01';
      await universalRouter.connect(signer).singleExecute(command, bytesData);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDC to BNT on Bancor', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        BNT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100000000';
      amountOutMin = '100000000000000';

      const command = '0x051044';
      const bytesData = iface.encodeFunctionData('tradeBySourceAmount', [
        USDC_ADDRESS,
        BNT_ADDRESS,
        amountIn,
        amountOutMin,
        deadline,
        swapAccount,
      ]);

      await universalRouter.connect(signer).singleExecute(command, bytesData);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDC to USDT on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100000000';
      amountOutMin = '1000000';
      const pair = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const fromToken = USDC_ADDRESS;
      const toToken = USDT_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const command = '0x030014';
      const functionSelector = '3df02124';

      const bytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        '01' +
        '00';

      await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDC to USDT to LUSD on Curve stable pools', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        SUSD_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100000000';
      amountOutMin = '1000000';
      const swapLength = '02';

      const iOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const jOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const iTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const jTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('3').toHexString(), 1).slice(2);

      const fromToken = USDC_ADDRESS;
      const pairOne = 'bEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const toTokenOne = USDT_ADDRESS.slice(2);
      const pairTwo = 'A5407eAE9Ba41422680e2e00537571bcC53efBfD';
      const toTokenTwo = SUSD_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const command = '0x030014';
      const functionSelectorOne = '3df02124';
      const functionSelectorTwo = '3df02124';

      const bytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pairOne +
        toTokenOne +
        pairTwo +
        toTokenTwo +
        functionSelectorOne +
        iOne +
        jOne +
        functionSelectorTwo +
        iTwo +
        jTwo +
        swapLength +
        '00';

      await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDT to USDC to STG on Curve crypto pools', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        STG_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '1000000000000000';

      ({ approveTxCost } = await approveERC20(signer, token0Contract, universalRouter, amountIn));

      const swapLength = '02';

      const iOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const jOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const iTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const jTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);

      const fromToken = USDT_ADDRESS;
      const pairOne = 'bEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const toTokenOne = USDC_ADDRESS.slice(2);
      const pairTwo = '3211c6cbef1429da3d0d58494938299c92ad5860';
      const toTokenTwo = STG_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const command = '0x030014';
      const functionSelectorOne = '3df02124';
      const functionSelectorTwo = '5b41b908';

      const bytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pairOne +
        toTokenOne +
        pairTwo +
        toTokenTwo +
        functionSelectorOne +
        iOne +
        jOne +
        functionSelectorTwo +
        iTwo +
        jTwo +
        swapLength +
        '00';

      await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDT to USDC to STG to FRAX on Curve crypto pools', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        MIM_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '1000000000000';

      ({ approveTxCost } = await approveERC20(signer, token0Contract, universalRouter, amountIn));

      const swapLength = '03';

      const iOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const jOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const iTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const jTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const iThree = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const jThree = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);

      const fromToken = USDT_ADDRESS;
      const pairOne = 'bEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const toTokenOne = USDC_ADDRESS.slice(2);
      const pairTwo = 'A5407eAE9Ba41422680e2e00537571bcC53efBfD';
      const toTokenTwo = DAI_ADDRESS.slice(2);
      const pairThree = '5a6A4D54456819380173272A5E8E9B9904BdF41B';
      const toTokenThree = MIM_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const command = '0x030014';
      const functionSelectorOne = '3df02124';
      const functionSelectorTwo = '3df02124';
      const functionSelectorThree = 'a6417ed6';

      const bytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pairOne +
        toTokenOne +
        pairTwo +
        toTokenTwo +
        pairThree +
        toTokenThree +
        functionSelectorOne +
        iOne +
        jOne +
        functionSelectorTwo +
        iTwo +
        jTwo +
        functionSelectorThree +
        iThree +
        jThree +
        swapLength +
        '00';

      await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap WETH to BAL on Balancer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        BAL_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));
      const Balancer = {
        address: BALANCER_ROUTER,
      };
      ({ approveTxCost } = await approveERC20(signer, token0Contract, Balancer, token0Balance));

      amountIn = '1000000000000000';
      amountOutMin = '10000000000';
      const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014';

      const command = '0x040000';
      const singleSwap = [poolId, 0, WETH_ADDRESS, BAL_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, swapAccount, false];

      const bytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDC to WETH to WBTC on Balancer multiswap', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WBTC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const command = '0x240000';
      amountIn = '100000000';
      amountOutMin = '1000';

      const pool0 = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';
      const pool1 = '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e';
      const userData = '0x';
      const swapAddresses = [USDC_ADDRESS, WETH_ADDRESS, WBTC_ADDRESS];

      // Token info
      const token_data: { [key: string]: { limit: string } } = {};
      token_data[USDC_ADDRESS] = {
        limit: amountIn,
      };
      token_data[WETH_ADDRESS] = {
        limit: '0',
      };
      token_data[WBTC_ADDRESS] = {
        limit: '0',
      };
      // Structuring input info for swaps
      swapAddresses.sort();
      const swap_indices: { [key: string]: number } = {};
      for (let i = 0; i < swapAddresses.length; i++) {
        swap_indices[swapAddresses[i]] = i;
      }
      // Pushing paths in sorted order to array
      const assets = [];
      const limits = [];
      for (const token of swapAddresses) {
        assets.push(token.toLowerCase());
        limits.push(token_data[token]['limit']);
      }
      // Get indices for each asset
      const USDC_INDEX = swap_indices[USDC_ADDRESS];
      const WETH_INDEX = swap_indices[WETH_ADDRESS];
      const WBTC_INDEX = swap_indices[WBTC_ADDRESS];
      const zero = 0;
      // Using GIVEN_IN we can define what we expect out for the first swap
      // However, in the second swap we want to send max tokens and we won't have this amount
      const firstSwap = [pool0, USDC_INDEX, WETH_INDEX, amountIn, userData];
      const secondSwap = [pool1, WETH_INDEX, WBTC_INDEX, zero, userData];
      const swap = [firstSwap, secondSwap];
      const funds = [universalRouter.address, false, swapAccount, false];
      const kind = 0; // GIVEN_IN

      let bytesData = iface.encodeFunctionData('batchSwap', [
        kind,
        swap,
        assets,
        funds,
        limits,
        deadline,
      ]);
      bytesData = bytesData + USDC_ADDRESS.slice(2);

      await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });
  });

  describe('Swaps ETH to token', function () {
    it('Should swap ETH to USDC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '100000000000000';
      amountOutMin = '100000';

      const command = '0x014000';
      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = ethers.constants.AddressZero.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      const tx = await universalRouter.connect(signer).singleExecute(command, inputs, {
        value: amountIn,
        gasLimit: 1000000,
      });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should multiswap ETH to WBTC to USDC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '100000000000000';
      amountOutMin = '100000'; // TODO: Change to 10 again

      const command = '0x014000';
      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data =
        ethers.constants.AddressZero.slice(2) + WBTC_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + data + '02' + '00';

      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, inputs, { gasLimit: 1000000, value: amountIn });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const command = '0x024000'; // Addr: TBD, Amount: TBD

      amountIn = '100000000000000';
      amountOutMin = '100000';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const fee = 500;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = ethers.constants.AddressZero.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + pathData + '01' + '00';

      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, inputs, { gasLimit: 1000000, value: amountIn });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should multiswap ETH to USDT to USDC on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      const command = '0x024000'; // Addr: c0, Amount: 00

      amountIn = '100000000000000';
      amountOutMin = '100000';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const fee0 = 3000;
      const fee1 = 100;
      const encodedFee0 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee0), 3).slice(2);
      const encodedFee1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee1), 3).slice(2);
      const pathData =
        ethers.constants.AddressZero.slice(2) +
        encodedFee0 +
        USDT_ADDRESS.slice(2) +
        encodedFee1 +
        USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const inputs = '0x' + amountInBytes + amountOutMinBytes + pathData + '02' + '00';

      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, inputs, { gasLimit: 1000000, value: amountIn });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDT_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '100000000000000';
      amountOutMin = '100000';
      const pair = '0xd51a44d3fae010294c616388b506acda1bfaae46';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const fromToken = ethers.constants.AddressZero;
      const toToken = USDT_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const command = '0x030014';
      const functionSelector = '394747c5';

      const bytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        '01' +
        '00';

      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
        value: amountIn,
      });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should multiswap ETH to USDT to SUSD on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, SUSD_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '100000000000000';
      amountOutMin = '1000000';
      const pairOne = '0xd51a44d3fae010294c616388b506acda1bfaae46';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const fromToken = ethers.constants.AddressZero;
      const toTokenOne = USDT_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const iTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const jTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('3').toHexString(), 1).slice(2);
      const pairTwo = 'A5407eAE9Ba41422680e2e00537571bcC53efBfD';
      const toTokenTwo = SUSD_ADDRESS.slice(2);

      const command = '0x030014';
      const functionSelectorOne = '394747c5';
      const functionSelectorTwo = '3df02124';

      const bytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pairOne.slice(2) +
        toTokenOne +
        pairTwo +
        toTokenTwo +
        functionSelectorOne +
        i +
        j +
        functionSelectorTwo +
        iTwo +
        jTwo +
        '02' +
        '00';

      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
        value: amountIn,
      });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to BAL on Balancer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, BAL_ADDRESS));

      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = 100000000000000;
      amountOutMin = 100000000000;
      const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014';

      const command = '0x040000';
      const singleSwap = [poolId, 0, ethers.constants.AddressZero, BAL_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, swapAccount, false];

      const bytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
        value: amountIn,
      });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to OHM to to WBTC on Balancer multiswap', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, BTRFLY_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const command = '0x240000';
      amountIn = '100000000000000';
      amountOutMin = '10';

      const pool0 = '0xd1ec5e215e8148d76f4460e4097fd3d5ae0a35580002000000000000000003d3';
      const pool1 = '0x2de32a7c98c3ef6ec79e703500e8ca5b2ec819aa00020000000000000000031c';
      const userData = '0x';

      const swapAddresses = [ethers.constants.AddressZero, OHM_ADDRESS, BTRFLY_ADDRESS];

      // Token info
      const token_data: { [key: string]: { limit: string } } = {};
      token_data[ethers.constants.AddressZero] = {
        limit: amountIn.toString(),
      };
      token_data[OHM_ADDRESS] = {
        limit: '0',
      };
      token_data[BTRFLY_ADDRESS] = {
        limit: '0',
      };
      // Structuring input info for swaps
      swapAddresses.sort();
      const swap_indices: { [key: string]: number } = {};
      for (let i = 0; i < swapAddresses.length; i++) {
        swap_indices[swapAddresses[i]] = i;
      }
      // Pushing paths in sorted order to array
      const assets = [];
      const limits = [];
      for (const token of swapAddresses) {
        assets.push(token.toLowerCase());
        limits.push(token_data[token]['limit']);
      }
      // Get indices for each asset
      const ETH_INDEX = swap_indices[ethers.constants.AddressZero];
      const SECOND_INDEX = swap_indices[OHM_ADDRESS];
      const THIRD_INDEX = swap_indices[BTRFLY_ADDRESS];
      const zero = 0;
      // Using GIVEN_IN we can define what we expect out for the first swap
      // However, in the second swap we want to send max tokens and we won't have this amount
      const firstSwap = [pool0, ETH_INDEX, SECOND_INDEX, amountIn.toString(), userData];
      const secondSwap = [pool1, SECOND_INDEX, THIRD_INDEX, zero, userData];
      const swap = [firstSwap, secondSwap];
      const funds = [universalRouter.address, false, swapAccount, false];
      const kind = 0; // GIVEN_IN

      let bytesData = iface.encodeFunctionData('batchSwap', [
        kind,
        swap,
        assets,
        funds,
        limits,
        deadline,
      ]);
      bytesData = bytesData + USDC_ADDRESS.slice(2);

      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
        value: amountIn,
      });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '1000000000000000';
      amountOutMin = '1000000';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDC_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '00';
      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, bytesData, { value: amountIn });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should multiswap ETH to USDC to USDT on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '1000000000000000';
      amountOutMin = '1000000';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDC_ADDRESS, USDT_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '00';
      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, bytesData, { value: amountIn });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost.toString(),
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on Pancake', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '1000000000000000';
      amountOutMin = '1000000';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDT_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '01';
      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, bytesData, { value: amountIn });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should multiswap ETH to USDC to STG on Pancake', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        STG_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000000000';
      amountOutMin = '10000000000000';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDC_ADDRESS, STG_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '01';
      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, bytesData, { value: amountIn });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost.toString(),
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });
  });

  describe('Swaps token to ETH', function () {
    it('Should swap USDC to ETH on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      amountIn = '10000000';
      amountOutMin = '100000000000000';

      ({ approveTxCost } = await approveERC20(signer, token0Contract, universalRouter, amountIn));

      const command = '0x014000';
      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDC_ADDRESS.slice(2) + WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient (2 bytes);
      const inputs =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        swapAccount.slice(2) +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const tx = await universalRouter.connect(signer).singleExecute(command, inputs);
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should multiswap USDC to USDT to ETH on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '10000000';
      amountOutMin = '10000000000000';

      ({ approveTxCost } = await approveERC20(signer, token0Contract, universalRouter, amountIn));

      const command = '0x014000';
      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDC_ADDRESS.slice(2) + USDT_ADDRESS.slice(2) + WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient (2 bytes);
      const inputs =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        swapAccount.slice(2) +
        universalRouter.address.slice(2) +
        '02' +
        '01';

      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, inputs, { gasLimit: 1000000 });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should swap USDC to ETH on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const command = '0x024000'; // Addr: TBD, Amount: TBD

      amountIn = 10000000;
      amountOutMin = 1000000000000;

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 500;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDC_ADDRESS.slice(2) + encodedFee + WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const inputs =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        swapAccount.slice(2) +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, inputs, { gasLimit: 1000000 });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should multiswap USDT to USDC to ETH on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDT_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const command = '0x024000';

      amountIn = 10000000;
      amountOutMin = 1000000000000;

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee0 = 100;
      const fee1 = 3000;
      const encodedFee0 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee0), 3).slice(2);
      const encodedFee1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee1), 3).slice(2);
      const pathData =
        USDT_ADDRESS.slice(2) +
        encodedFee0 +
        USDC_ADDRESS.slice(2) +
        encodedFee1 +
        WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const inputs =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        swapAccount.slice(2) +
        universalRouter.address.slice(2) +
        '02' +
        '01';

      const tx = await universalRouter
        .connect(signer)
        .singleExecute(command, inputs, { gasLimit: 1000000 });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should swap USDT to ETH on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDT_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      amountIn = 10000000;
      amountOutMin = 100000000000000;
      const pair = '0xd51a44d3fae010294c616388b506acda1bfaae46';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const fromToken = USDT_ADDRESS;
      const toToken = ethers.constants.AddressZero.slice(2);

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const command = '0x030014';
      const functionSelector = '394747c5';

      const bytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        '01' +
        '00';

      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should multiswap SUSD to USDT to ETH on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, SUSD_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100343409859723236';
      amountOutMin = '10';

      const fromToken = SUSD_ADDRESS;
      const pairOne = 'A5407eAE9Ba41422680e2e00537571bcC53efBfD';
      const iOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('3').toHexString(), 1).slice(2);
      const jOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);

      const pairTwo = 'd51a44d3fae010294c616388b506acda1bfaae46';
      const iTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const jTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const toTokenTwo = ethers.constants.AddressZero.slice(2);
      const toTokenOne = USDT_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const command = '0x030014';
      const functionSelectorOne = '3df02124';
      const functionSelectorTwo = '394747c5';

      const bytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pairOne +
        toTokenOne +
        pairTwo +
        toTokenTwo +
        functionSelectorOne +
        iOne +
        jOne +
        functionSelectorTwo +
        iTwo +
        jTwo +
        '02' +
        '00';

      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should swap BAL to ETH on Balancer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, BAL_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = token0Balance.toString();
      amountOutMin = '1000';
      const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);

      const command = '0x040000';
      const singleSwap = [poolId, 0, BAL_ADDRESS, ethers.constants.AddressZero, amountIn, '0x'];
      const funds = [universalRouter.address, false, swapAccount, false];

      const bytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should swap DAI to USDC to ETH on Balancer multiswap', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, DAI_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const command = '0x240000';
      amountIn = '10000000000000000000';
      amountOutMin = '10';
      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);

      const pool0 = '0x178e029173417b1f9c8bc16dcec6f697bc32374600000000000000000000025d';
      const pool1 = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';
      const userData = '0x';
      const swapAddresses = [DAI_ADDRESS, USDC_ADDRESS, ethers.constants.AddressZero];

      // Token info
      const token_data: { [key: string]: { limit: string } } = {};
      token_data[DAI_ADDRESS] = {
        limit: amountIn,
      };
      token_data[USDC_ADDRESS] = {
        limit: '0',
      };
      token_data[ethers.constants.AddressZero] = {
        limit: '0',
      };
      // Structuring input info for swaps
      swapAddresses.sort();
      const swap_indices: { [key: string]: number } = {};
      for (let i = 0; i < swapAddresses.length; i++) {
        swap_indices[swapAddresses[i]] = i;
      }
      // Pushing paths in sorted order to array
      const assets = [];
      const limits = [];
      for (const token of swapAddresses) {
        assets.push(token.toLowerCase());
        limits.push(token_data[token]['limit']);
      }
      // Get indices for each asset
      const DAI_INDEX = swap_indices[DAI_ADDRESS];
      const USDC_INDEX = swap_indices[USDC_ADDRESS];
      const ETH_INDEX = swap_indices[ethers.constants.AddressZero];
      const zero = 0;
      // Using GIVEN_IN we can define what we expect out for the first swap
      // However, in the second swap we want to send max tokens and we won't have this amount
      const firstSwap = [pool0, DAI_INDEX, USDC_INDEX, amountIn, userData];
      const secondSwap = [pool1, USDC_INDEX, ETH_INDEX, zero, userData];
      const swap = [firstSwap, secondSwap];
      const funds = [universalRouter.address, false, swapAccount, false];
      const kind = 0; // GIVEN_IN

      let bytesData = iface.encodeFunctionData('batchSwap', [
        kind,
        swap,
        assets,
        funds,
        limits,
        deadline,
      ]);
      bytesData = bytesData + DAI_ADDRESS.slice(2);

      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData, {
        gasLimit: 1000000,
      });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should swap USDC to ETH on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WETH_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '10000000';
      amountOutMin = '10';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactTokensForETH', [
        amountIn,
        amountOutMin,
        [USDC_ADDRESS, WETH_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '00';
      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData);
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should swap USDC to USDT to ETH on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WETH_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '10000000';
      amountOutMin = '10';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactTokensForETH', [
        amountIn,
        amountOutMin,
        [USDC_ADDRESS, USDT_ADDRESS, WETH_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '00';
      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData);
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });

    it('Should swap USDC to ETH on Pancake', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WETH_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '10000000';
      amountOutMin = '10';

      const command = '0x00d004';
      let bytesData = iface.encodeFunctionData('swapExactTokensForETH', [
        amountIn,
        amountOutMin,
        [USDC_ADDRESS, WETH_ADDRESS],
        swapAccount,
        deadline,
      ]);

      bytesData = bytesData + '01';
      const tx = await universalRouter.connect(signer).singleExecute(command, bytesData);
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'toETH'
      );
    });
    // NOTE: Pancake multiswap has no connectors for testing i.e. pairs are all x/ETH
  });

  describe('Cross-DEX swaps token to token', function () {
    it('Should swap WETH to USDT on UniV2 and USDT to USDC on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100000000000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const sushiCommand = '0x00d004';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = WETH_ADDRESS.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        '0',
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS],
        swapAccount,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, sushiCommand], [uniBytesData, sushiBytesData], {
          gasLimit: '1000000',
        });

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap WETH to USDT on UniV2 and USDT to USDC on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100000000000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const uniV3Command = '0x024000';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = WETH_ADDRESS.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const fee = 100;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDT_ADDRESS.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData = '0x' + amountInBytes + amountOutMinBytes + pathData + '01' + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, uniV3Command], [uniBytesData, uniV3BytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap WETH to USDT on UniV2 and USDT to USDC on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '1000000000000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const curveCommand = '0x030014';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = WETH_ADDRESS.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const pair = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const fromToken = USDT_ADDRESS;
      const toToken = USDC_ADDRESS.slice(2);

      const functionSelector = '3df02124';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        '01' +
        '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, curveCommand], [uniBytesData, curveBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDT to WETH to USDC on UniV2 and USDC to DAI on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        DAI_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '10000000';
      amountOutMin = '1000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const curveCommand = '0x030014';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDT_ADDRESS.slice(2) + WETH_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        universalRouter.address.slice(2) +
        '02' +
        '01';

      const pair = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const fromToken = USDC_ADDRESS;
      const toToken = DAI_ADDRESS.slice(2);

      const functionSelector = '3df02124';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        '01' +
        '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, curveCommand], [uniBytesData, curveBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDT to USDC on UniV2 and multiswap USDC to USDT to WBTC on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        WBTC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '1000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const curveCommand = '0x030014';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDT_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const swapLength = '02';
      const iOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const jOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const iTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const jTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);

      const fromToken = USDC_ADDRESS;
      const pairOne = 'bEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const toTokenOne = USDT_ADDRESS.slice(2);
      const pairTwo = 'd51a44d3fae010294c616388b506acda1bfaae46';
      const toTokenTwo = WBTC_ADDRESS.slice(2);

      const functionSelectorOne = '3df02124';
      const functionSelectorTwo = '5b41b908';

      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pairOne +
        toTokenOne +
        pairTwo +
        toTokenTwo +
        functionSelectorOne +
        iOne +
        jOne +
        functionSelectorTwo +
        iTwo +
        jTwo +
        swapLength +
        '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, curveCommand], [uniBytesData, curveBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDC to USDT on UniV2 and multiswap USDT to USDC to WETH on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WETH_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '10000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const sushiCommand = '0x00d004';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDC_ADDRESS.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        '0',
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS, WETH_ADDRESS],
        swapAccount,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, sushiCommand], [uniBytesData, sushiBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDC to USDT on Curve and USDT to WETH on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WETH_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // Curve is 07 - Masking 0x07 becomes 0x47
      const curveCommand = '0x430014';
      const uniCommand = '0x014000';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const pair = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const fromToken = USDC_ADDRESS;
      const toToken = USDT_ADDRESS.slice(2);

      const functionSelector = '3df02124';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const data = USDT_ADDRESS.slice(2) + WETH_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([curveCommand, uniCommand], [curveBytesData, uniBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDC to USDT to WBTC on Curve and WBTC to USDT on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = '100000000';
      amountOutMin = '10000';

      // Chained used 0x40 for mask: 0100 0000
      // Curve is 07 - Masking 0x07 becomes 0x47
      const curveCommand = '0x430014';
      const uniCommand = '0x014000';

      const swapLength = '02';

      const iOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const jOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const iTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const jTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);

      const fromToken = USDC_ADDRESS;
      const pairOne = 'bEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const toTokenOne = USDT_ADDRESS.slice(2);
      const pairTwo = 'd51a44d3fae010294c616388b506acda1bfaae46';
      const toTokenTwo = WBTC_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const functionSelectorOne = '3df02124';
      const functionSelectorTwo = '5b41b908';

      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pairOne +
        toTokenOne +
        pairTwo +
        toTokenTwo +
        functionSelectorOne +
        iOne +
        jOne +
        functionSelectorTwo +
        iTwo +
        jTwo +
        universalRouter.address.slice(2) +
        swapLength +
        '01';

      const data = WBTC_ADDRESS.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([curveCommand, uniCommand], [curveBytesData, uniBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDT to WETH on Sushi and WETH to USDC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const uniCommand = '0x014000';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, WETH_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = WETH_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, uniCommand], [sushiBytesData, uniBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDT to WETH on Sushi and WETH to USDT to USDC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const uniCommand = '0x014000';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, WETH_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = WETH_ADDRESS.slice(2) + USDT_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '02' + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, uniCommand], [sushiBytesData, uniBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDT to USDC to WETH on Sushi and WETH to WBTC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        WBTC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '10000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const uniCommand = '0x014000';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS, WETH_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = WETH_ADDRESS.slice(2) + WBTC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, uniCommand], [sushiBytesData, uniBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDT to WETH on Sushi and WETH to USDC on Balancer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '10';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const balancerCommand = '0x0401300164';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, WETH_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const poolId = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);

      const singleSwap = [poolId, 0, WETH_ADDRESS, USDC_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, swapAccount, false];

      let balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      balancerBytesData = balancerBytesData + amountInBytes + WETH_ADDRESS.slice(2);

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, balancerCommand], [sushiBytesData, balancerBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDC to USDT on UniV3 and USDT to WETH on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WETH_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const uniV3Command = '0x024000';
      const uniV2Command = '0x014000';

      amountIn = 100000000;
      amountOutMin = 100000;

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 100;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDC_ADDRESS.slice(2) + encodedFee + USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const uniV2data = USDT_ADDRESS.slice(2) + WETH_ADDRESS.slice(2);
      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniV2BytesData = '0x' + amountInBytes + amountOutMinBytes + uniV2data + '01' + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, uniV2Command], [uniV3BytesData, uniV2BytesData]);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should multiswap USDC to WETH to USDT on UniV3 and USDT to WBTC on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        WBTC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const uniV3Command = '0x024000';
      const sushiCommand = '0x00d004';

      amountIn = 10000000;
      amountOutMin = 1000;

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee0 = 500;
      const fee1 = 3000;
      const encodedFee0 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee0), 3).slice(2);
      const encodedFee1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee1), 3).slice(2);
      const pathData =
        USDC_ADDRESS.slice(2) +
        encodedFee0 +
        WETH_ADDRESS.slice(2) +
        encodedFee1 +
        USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        universalRouter.address.slice(2) +
        '02' +
        '01';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        '0',
        amountOutMin,
        [USDT_ADDRESS, WBTC_ADDRESS],
        swapAccount,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, sushiCommand], [uniV3BytesData, sushiBytesData]);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDT to USDC on Sushi and USDC to WETH to WBTC on Balancer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        WBTC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '10';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const balancerCommand = '0x24040401E4';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const pool0 = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';
      const pool1 = '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e';
      const userData = '0x';
      const swapAddresses = [USDC_ADDRESS, WETH_ADDRESS, WBTC_ADDRESS];

      // Token info
      const token_data: { [key: string]: { limit: string } } = {};
      token_data[USDC_ADDRESS] = {
        limit: amountIn,
      };
      token_data[WETH_ADDRESS] = {
        limit: '0',
      };
      token_data[WBTC_ADDRESS] = {
        limit: '0',
      };
      // Structuring input info for swaps
      swapAddresses.sort();
      const swap_indices: { [key: string]: number } = {};
      for (let i = 0; i < swapAddresses.length; i++) {
        swap_indices[swapAddresses[i]] = i;
      }
      // Pushing paths in sorted order to array
      const assets = [];
      const limits = [];
      for (const token of swapAddresses) {
        assets.push(token.toLowerCase());
        limits.push(token_data[token]['limit']);
      }
      // Get indices for each asset
      const USDC_INDEX = swap_indices[USDC_ADDRESS];
      const WETH_INDEX = swap_indices[WETH_ADDRESS];
      const WBTC_INDEX = swap_indices[WBTC_ADDRESS];
      const zero = 0;
      // Using GIVEN_IN we can define what we expect out for the first swap
      // However, in the second swap we want to send max tokens and we won't have this amount
      const firstSwap = [pool0, USDC_INDEX, WETH_INDEX, amountIn, userData];
      const secondSwap = [pool1, WETH_INDEX, WBTC_INDEX, zero, userData];
      const swap = [firstSwap, secondSwap];
      const funds = [universalRouter.address, false, swapAccount, false];
      const kind = 0; // GIVEN_IN

      let balancerBytesData = iface.encodeFunctionData('batchSwap', [
        kind,
        swap,
        assets,
        funds,
        limits,
        deadline,
      ]);
      balancerBytesData = balancerBytesData + USDC_ADDRESS.slice(2);

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, balancerCommand], [sushiBytesData, balancerBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap USDC to WETH to WBTC on Balancer and WBTC to USDT on Sushi ', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDC_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '10000000';
      amountOutMin = '10';

      // Chained used 0x40 for mask: 0100 0000
      // Balancer is 0x08 - Masking 0x08 becomes 0x48
      const balancerCommand = '0x240000';
      const sushiCommand = '0x00d004';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);

      const pool0 = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';
      const pool1 = '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e';
      const userData = '0x';
      const swapAddresses = [USDC_ADDRESS, WETH_ADDRESS, WBTC_ADDRESS];

      // Token info
      const token_data: { [key: string]: { limit: string } } = {};
      token_data[USDC_ADDRESS] = {
        limit: amountIn,
      };
      token_data[WETH_ADDRESS] = {
        limit: '0',
      };
      token_data[WBTC_ADDRESS] = {
        limit: '0',
      };
      // Structuring input info for swaps
      swapAddresses.sort();
      const swap_indices: { [key: string]: number } = {};
      for (let i = 0; i < swapAddresses.length; i++) {
        swap_indices[swapAddresses[i]] = i;
      }
      // Pushing paths in sorted order to array
      const assets = [];
      const limits = [];
      for (const token of swapAddresses) {
        assets.push(token.toLowerCase());
        limits.push(token_data[token]['limit']);
      }
      // Get indices for each asset
      const USDC_INDEX = swap_indices[USDC_ADDRESS];
      const WETH_INDEX = swap_indices[WETH_ADDRESS];
      const WBTC_INDEX = swap_indices[WBTC_ADDRESS];
      const zero = 0;
      // Using GIVEN_IN we can define what we expect out for the first swap
      // However, in the second swap we want to send max tokens and we won't have this amount
      const firstSwap = [pool0, USDC_INDEX, WETH_INDEX, amountIn, userData];
      const secondSwap = [pool1, WETH_INDEX, WBTC_INDEX, zero, userData];
      const swap = [firstSwap, secondSwap];
      const funds = [universalRouter.address, false, universalRouter.address, false];
      const kind = 0; // GIVEN_IN

      let balancerBytesData = iface.encodeFunctionData('batchSwap', [
        kind,
        swap,
        assets,
        funds,
        limits,
        deadline,
      ]);
      balancerBytesData = balancerBytesData + USDC_ADDRESS.slice(2);

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [WBTC_ADDRESS, USDT_ADDRESS],
        swapAccount,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, sushiCommand], [balancerBytesData, sushiBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap DAI to USDC to WETH to WBTC on Balancer and USDC to USDT on Sushi ', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        DAI_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000000000000000';
      amountOutMin = '10';

      // Chained used 0x40 for mask: 0100 0000
      // Balancer is 0x08 - Masking 0x08 becomes 0x48
      const balancerCommand = '0x240000';
      const sushiCommand = '0x00d004';

      const pool0 = '0x178e029173417b1f9c8bc16dcec6f697bc32374600000000000000000000025d';
      const pool1 = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';
      const pool2 = '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e';
      const userData = '0x';
      const swapAddresses = [DAI_ADDRESS, USDC_ADDRESS, WETH_ADDRESS, WBTC_ADDRESS];

      // Token info
      const token_data: { [key: string]: { limit: string } } = {};
      token_data[DAI_ADDRESS] = {
        limit: amountIn,
      };
      token_data[USDC_ADDRESS] = {
        limit: '0',
      };
      token_data[WETH_ADDRESS] = {
        limit: '0',
      };
      token_data[WBTC_ADDRESS] = {
        limit: '0',
      };
      // Structuring input info for swaps
      swapAddresses.sort();
      const swap_indices: { [key: string]: number } = {};
      for (let i = 0; i < swapAddresses.length; i++) {
        swap_indices[swapAddresses[i]] = i;
      }
      // Pushing paths in sorted order to array
      const assets = [];
      const limits = [];
      for (const token of swapAddresses) {
        assets.push(token.toLowerCase());
        limits.push(token_data[token]['limit']);
      }
      // Get indices for each asset
      const DAI_INDEX = swap_indices[DAI_ADDRESS];
      const USDC_INDEX = swap_indices[USDC_ADDRESS];
      const WETH_INDEX = swap_indices[WETH_ADDRESS];
      const WBTC_INDEX = swap_indices[WBTC_ADDRESS];
      const zero = 0;
      // Using GIVEN_IN we can define what we expect out for the first swap
      // However, in the second swap we want to send max tokens and we won't have this amount
      const firstSwap = [pool0, DAI_INDEX, USDC_INDEX, amountIn, userData];
      const secondSwap = [pool1, USDC_INDEX, WETH_INDEX, zero, userData];
      const thirdSwap = [pool2, WETH_INDEX, WBTC_INDEX, zero, userData];
      const swap = [firstSwap, secondSwap, thirdSwap];
      const funds = [universalRouter.address, false, universalRouter.address, false];
      const kind = 0; // GIVEN_IN

      let balancerBytesData = iface.encodeFunctionData('batchSwap', [
        kind,
        swap,
        assets,
        funds,
        limits,
        deadline,
      ]);
      balancerBytesData = balancerBytesData + DAI_ADDRESS.slice(2);

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [WBTC_ADDRESS, USDT_ADDRESS],
        swapAccount,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, sushiCommand], [balancerBytesData, sushiBytesData]);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap WETH to USDC on Balancer and USDC to USDT on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const balancerCommand = '0x440000';
      const uniV3Command = '0x024000';

      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = 10000000;
      const poolId = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);

      const singleSwap = [poolId, 0, WETH_ADDRESS, USDC_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, universalRouter.address, false];

      const balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 100;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDC_ADDRESS.slice(2) + encodedFee + USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData = '0x' + amountInBytes + amountOutMinBytes + pathData + '01' + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, uniV3Command], [balancerBytesData, uniV3BytesData]);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should swap WETH to USDC on Balancer and multiswap USDC to WETH to USDT on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const balancerCommand = '0x440000';
      const uniV3Command = '0x024000';

      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = 1000;
      const poolId = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);

      const singleSwap = [poolId, 0, WETH_ADDRESS, USDC_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, universalRouter.address, false];

      const balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee0 = 500;
      const fee1 = 500;
      const encodedFee0 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee0), 3).slice(2);
      const encodedFee1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee1), 3).slice(2);
      const pathData =
        USDC_ADDRESS.slice(2) +
        encodedFee0 +
        WETH_ADDRESS.slice(2) +
        encodedFee1 +
        USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData = '0x' + amountInBytes + amountOutMinBytes + pathData + '02' + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, uniV3Command], [balancerBytesData, uniV3BytesData]);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });
  });

  describe('Cross-DEX swaps ETH to token', function () {
    it('Should swap ETH to USDT on UniV2 and USDT to USDC on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '100000000000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const sushiCommand = '0x00d004';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = ethers.constants.AddressZero.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        '0',
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS],
        swapAccount,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, sushiCommand], [uniBytesData, sushiBytesData], {
          gasLimit: 1000000,
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on UniV2 and USDT to USDC on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '100000000000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const uniV3Command = '0x024000';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = ethers.constants.AddressZero.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const fee = 100;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDT_ADDRESS.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData = '0x' + amountInBytes + amountOutMinBytes + pathData + '01' + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, uniV3Command], [uniBytesData, uniV3BytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on UniV2 and USDT to USDC on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '1000000000000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const curveCommand = '0x030014';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = ethers.constants.AddressZero.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const pair = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const fromToken = USDT_ADDRESS;
      const toToken = USDC_ADDRESS.slice(2);

      const functionSelector = '3df02124';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        '01' +
        '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, curveCommand], [uniBytesData, curveBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should multiswap WETH to USDT to USDC on UniV2 and USDC to DAI on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, DAI_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '1000000000000000';
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const curveCommand = '0x030014';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = WETH_ADDRESS.slice(2) + USDT_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        universalRouter.address.slice(2) +
        '02' +
        '01';

      const pair = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const fromToken = USDC_ADDRESS;
      const toToken = DAI_ADDRESS.slice(2);

      const functionSelector = '3df02124';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        '01' +
        '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, curveCommand], [uniBytesData, curveBytesData]);
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on UniV2 and multiswap USDC to USDT to WBTC on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, WBTC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '1000000000000000';
      amountOutMin = '1000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const curveCommand = '0x030014';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = ethers.constants.AddressZero.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const swapLength = '02';
      const iOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const jOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const iTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const jTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);

      const fromToken = USDC_ADDRESS;
      const pairOne = 'bEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const toTokenOne = USDT_ADDRESS.slice(2);
      const pairTwo = 'd51a44d3fae010294c616388b506acda1bfaae46';
      const toTokenTwo = WBTC_ADDRESS.slice(2);

      const functionSelectorOne = '3df02124';
      const functionSelectorTwo = '5b41b908';

      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pairOne +
        toTokenOne +
        pairTwo +
        toTokenTwo +
        functionSelectorOne +
        iOne +
        jOne +
        functionSelectorTwo +
        iTwo +
        jTwo +
        swapLength +
        '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, curveCommand], [uniBytesData, curveBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on UniV2 and multiswap USDT to USDC to WETH on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, WETH_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '1000000000000000';
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const sushiCommand = '0x00d004';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = ethers.constants.AddressZero.slice(2) + USDT_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        '0',
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS, WETH_ADDRESS],
        swapAccount,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, sushiCommand], [uniBytesData, sushiBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on Curve and USDT to USDC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      // Chained used 0x40 for mask: 0100 0000
      // Curve is 07 - Masking 0x07 becomes 0x47
      const curveCommand = '0x030014';
      const uniCommand = '0x014000';
      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = 10000000;
      const pair = '0xd51a44d3fae010294c616388b506acda1bfaae46';

      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const fromToken = ethers.constants.AddressZero;
      const toToken = USDT_ADDRESS.slice(2);

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const functionSelector = '394747c5';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const data = USDT_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([curveCommand, uniCommand], [curveBytesData, uniBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should multiswap ETH to USDT to USDC on Curve and USDC to WBTC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, WBTC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = 10000;

      // Chained used 0x40 for mask: 0100 0000
      // Curve is 07 - Masking 0x07 becomes 0x47
      const curveCommand = '0x430014';
      const uniCommand = '0x014000';

      const swapLength = '02';
      const iOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const jOne = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const iTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const jTwo = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);

      const fromToken = ethers.constants.AddressZero;
      const pairOne = 'd51a44d3fae010294c616388b506acda1bfaae46';
      const toTokenOne = USDT_ADDRESS.slice(2);
      const pairTwo = 'bEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const toTokenTwo = USDC_ADDRESS.slice(2);

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const functionSelectorOne = '394747c5';
      const functionSelectorTwo = '3df02124';

      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pairOne +
        toTokenOne +
        pairTwo +
        toTokenTwo +
        functionSelectorOne +
        iOne +
        jOne +
        functionSelectorTwo +
        iTwo +
        jTwo +
        universalRouter.address.slice(2) +
        swapLength +
        '01';

      const data = USDC_ADDRESS.slice(2) + WBTC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([curveCommand, uniCommand], [curveBytesData, uniBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on Sushi and USDT to USDC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '1000000000000000';
      amountOutMin = '10000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const uniCommand = '0x014000';

      let sushiBytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDT_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDT_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, uniCommand], [sushiBytesData, uniBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on Sushi and USDT to WETH to USDC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '10000000000000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const uniCommand = '0x014000';

      let sushiBytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDT_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDT_ADDRESS.slice(2) + WETH_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '02' + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, uniCommand], [sushiBytesData, uniBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should multiswap ETH to USDC to USDT on Sushi and USDT to WBTC on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, WBTC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '1000000000000000';
      amountOutMin = '10000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const uniCommand = '0x014000';

      let sushiBytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDC_ADDRESS, USDT_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDT_ADDRESS.slice(2) + WBTC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, uniCommand], [sushiBytesData, uniBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on Sushi and USDC to WETH on Balancer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, WETH_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '10000000000000000';
      amountOutMin = '10000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const balancerCommand = '0x0401300164';

      let sushiBytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDC_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const poolId = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);

      const singleSwap = [poolId, 0, USDC_ADDRESS, WETH_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, swapAccount, false];

      const balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, balancerCommand], [sushiBytesData, balancerBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on Sushi and USDC to WETH to WBTC on Balancer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, WBTC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = '10000000000000000';
      amountOutMin = '1000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const balancerCommand = '0x24040401E4';

      let sushiBytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDC_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const pool0 = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';
      const pool1 = '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e';
      const userData = '0x';
      const swapAddresses = [USDC_ADDRESS, WETH_ADDRESS, WBTC_ADDRESS];

      // Token info
      const token_data: { [key: string]: { limit: string } } = {};
      token_data[USDC_ADDRESS] = {
        limit: '2000000',
      };
      token_data[WETH_ADDRESS] = {
        limit: '0',
      };
      token_data[WBTC_ADDRESS] = {
        limit: '0',
      };
      // Structuring input info for swaps
      swapAddresses.sort();
      const swap_indices: { [key: string]: number } = {};
      for (let i = 0; i < swapAddresses.length; i++) {
        swap_indices[swapAddresses[i]] = i;
      }
      // Pushing paths in sorted order to array
      const assets = [];
      const limits = [];
      for (const token of swapAddresses) {
        assets.push(token.toLowerCase());
        limits.push(token_data[token]['limit']);
      }
      // Get indices for each asset
      const USDC_INDEX = swap_indices[USDC_ADDRESS];
      const WETH_INDEX = swap_indices[WETH_ADDRESS];
      const WBTC_INDEX = swap_indices[WBTC_ADDRESS];
      const zero = 0;
      // Using GIVEN_IN we can define what we expect out for the first swap
      // However, in the second swap we want to send max tokens and we won't have this amount
      const firstSwap = [pool0, USDC_INDEX, WETH_INDEX, amountIn, userData];
      const secondSwap = [pool1, WETH_INDEX, WBTC_INDEX, zero, userData];
      const swap = [firstSwap, secondSwap];
      const funds = [universalRouter.address, false, swapAccount, false];
      const kind = 0; // GIVEN_IN

      let balancerBytesData = iface.encodeFunctionData('batchSwap', [
        kind,
        swap,
        assets,
        funds,
        limits,
        deadline,
      ]);
      balancerBytesData = balancerBytesData + USDC_ADDRESS.slice(2);

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, balancerCommand], [sushiBytesData, balancerBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn,
        amountOutMin,
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on UniV3 and USDT to WETH on UniV2', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, WETH_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      const uniV3Command = '0x024000';
      const uniV2Command = '0x014000';

      amountIn = '1000000000000000';
      amountOutMin = 100000;

      const amountInBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(Number(amountIn)), 32)
        .slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 500;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = ethers.constants.AddressZero.slice(2) + encodedFee + USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const uniV2data = USDT_ADDRESS.slice(2) + WETH_ADDRESS.slice(2);
      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniV2BytesData = '0x' + amountInBytes + amountOutMinBytes + uniV2data + '01' + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, uniV2Command], [uniV3BytesData, uniV2BytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should multiswap ETH to USDC to USDT on UniV3 and USDT to WBTC on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, WBTC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      const uniV3Command = '0x024000';
      const sushiCommand = '0x00d004';

      amountIn = '1000000000000000';
      amountOutMin = 1000;

      const amountInBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(Number(amountIn)), 32)
        .slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee0 = 500;
      const fee1 = 100;
      const encodedFee0 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee0), 3).slice(2);
      const encodedFee1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee1), 3).slice(2);
      const pathData =
        ethers.constants.AddressZero.slice(2) +
        encodedFee0 +
        USDC_ADDRESS.slice(2) +
        encodedFee1 +
        USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        universalRouter.address.slice(2) +
        '02' +
        '01';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        '0',
        amountOutMin,
        [USDT_ADDRESS, WBTC_ADDRESS],
        swapAccount,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, sushiCommand], [uniV3BytesData, sushiBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on Balancer and USDC to USDT on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, WETH_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      const balancerCommand = '0x040000';
      const uniV3Command = '0x024000';

      amountIn = 100000000000000;
      amountOutMin = 100000000000;
      const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014';

      const singleSwap = [poolId, 0, ethers.constants.AddressZero, BAL_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, universalRouter.address, false];

      const balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 3000;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = BAL_ADDRESS.slice(2) + encodedFee + WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData = '0x' + amountInBytes + amountOutMinBytes + pathData + '01' + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, uniV3Command], [balancerBytesData, uniV3BytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to BAL on Balancer and multiswap BAL to WETH to USDT on UniV3', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDT_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      const balancerCommand = '0x440000';
      const uniV3Command = '0x024000';

      amountIn = ethers.BigNumber.from('1000000000000000');
      amountOutMin = 1000000;
      const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014';

      const singleSwap = [poolId, 0, ethers.constants.AddressZero, BAL_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, universalRouter.address, false];

      let balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      balancerBytesData = balancerBytesData + WETH_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);

      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const fee0 = 3000;
      const fee1 = 3000;

      const encodedFee0 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee0), 3).slice(2);
      const encodedFee1 = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee1), 3).slice(2);
      const pathData =
        BAL_ADDRESS.slice(2) +
        encodedFee0 +
        WETH_ADDRESS.slice(2) +
        encodedFee1 +
        USDT_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData = '0x' + amountInBytes + amountOutMinBytes + pathData + '02' + '00';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, uniV3Command], [balancerBytesData, uniV3BytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        '0',
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        'fromETH'
      );
    });
  });

  describe('Bridge tokens', function () {
    it('Should bridge USDC on Hop', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = '10000000';
      const command = '0x06E444';
      const functionSelector = '0xdeace8f5'; // sendToL2()

      const toChainId = '000000000000000000000000000000000000000000000000000000000000a4b1'; // Chain: 42161 (Arbitrum)
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000000989680';
      const amountOut = '00000000000000000000000000000000000000000000000000000000000f4240';
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); //
      const relayerAddress = '0xa6a688F107851131F0E1dce493EbBebFAf99203e';
      const relayer = addressPadding + relayerAddress.slice(2);
      const relayerFee = '0000000000000000000000000000000000000000000000000000000000000000'; // Set to zero on Hop tx's

      const inputData =
        functionSelector + // 4
        toChainId + // 36
        receiver + // 68
        amount + // 100
        amountOut + // 132
        timestamp.slice(2) + // 164
        relayer + // 196
        relayerFee + // 228
        USDC_ADDRESS.slice(2) + // 248
        '01';

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should bridge USDC on Hyphen', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = 100000000;
      amountOutMin = '100';

      const command = '0x0d3064';
      const functionSelector = '0x55d73595'; // depositErc20()

      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(56), 32).slice(2);
      const tokenAddress = addressPadding + USDC_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const stringSlot = '00000000000000000000000000000000000000000000000000000000000000a0';
      const stringLength = '0000000000000000000000000000000000000000000000000000000000000009'; // 9 characters
      const string = hre.ethers.utils.formatBytes32String('Sideshift'); // Sideshift
      const inputData =
        functionSelector +
        toChainId +
        tokenAddress +
        receiver +
        amount +
        stringSlot +
        stringLength +
        string.slice(2);

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should bridge USDC on Celer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = '30000000';
      const command = '0x283044';
      const functionSelector = '0xa5977fbb'; // depositErc20()

      const toChainId = '0000000000000000000000000000000000000000000000000000000000000038'; // Chain: 56 (BSC)
      const tokenAddress = addressPadding + USDC_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000001c9c380';
      const nonce = '0000000000000000000000000000000000000000000000000000018a62abddd9'; // Timestamp of: 200642000
      const maxSlippage = '000000000000000000000000000000000000000000000000000000000000c350'; // 50,000 (0.5%)

      const inputData =
        functionSelector + receiver + tokenAddress + amount + toChainId + nonce + maxSlippage;

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should bridge USDC on Across', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, WETH_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = '10000000000000000';
      const command = '0x073044';
      const functionSelector = '0x49228978'; // deposit()

      const toChainId = '000000000000000000000000000000000000000000000000000000000000a4b1'; // Chain: 42161 (Arbitrum)
      const tokenAddress = addressPadding + WETH_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '000000000000000000000000000000000000000000000000002386f26fc10000';
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); // Needs to be a timestamp within 3600 seconds of current time
      const relayerFee = '0000000000000000000000000000000000000000000000000000835e50958811'; // Typically 0.06 - 0.12% of transaction - rand value used here of 144441102141457

      const inputData =
        functionSelector +
        receiver +
        tokenAddress +
        amount +
        toChainId +
        relayerFee +
        timestamp.slice(2);

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should bridge USDC on Multichain', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = '10000000';
      const command = '0x0c9044';
      const functionSelector = '0xedbdf5e2'; // anySwapOutUnderlying()

      const toChainId = '000000000000000000000000000000000000000000000000000000000000a4b1'; // Chain: 42161 (Arbitrum)
      const receiver = addressPadding + swapAccount.slice(2);
      const anyToken = addressPadding + ANY_USDC_ADDRESS.slice(2); // Must specific the anyToken in the call
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000000989680'; // 10000000

      const inputData =
        functionSelector +
        anyToken + // 4
        receiver + // 68
        amount + // 100
        toChainId +
        fromToken;

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should bridge USDC on Synapse via deposit', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = '10000000';
      const command = '0x095064';
      const functionSelector = '0x90d25074'; // deposit()

      const toChainId = '000000000000000000000000000000000000000000000000000000000000a4b1'; // Chain: 42161 (Arbitrum)
      const receiver = addressPadding + swapAccount.slice(2);
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000000989680'; // 10000000

      const inputData =
        functionSelector +
        receiver + // 4
        toChainId + // 36
        fromToken + // 68
        amount + // 100
        fromToken;

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    // Right padding for recipient example: https://etherscan.io/tx/0xc9f0ccd28b23ccc9cc2bd0bd6803d97766b06cf50a02067c892181e346291b5c
    // Right padding for chainId
    it('Should bridge USDC on AllBridge', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = 10000000;
      const command = '0x0b3084';
      const functionSelector = '0x7bacc91e'; // lock()

      // ISSUE: Unclear how to create the correct lockID - used tx from Etherscan
      const randLockId = ethers.BigNumber.from('1593724613221250925077356892126251226');
      const lockId = ethers.utils.hexZeroPad(ethers.utils.hexlify(randLockId), 32).slice(2);
      const paddedChainData = '534f4c0000000000000000000000000000000000000000000000000000000000'; // Chain: 42161 (Arbitrum)
      const bytesReceiver = '47fdd0b6ec29ee5d71316517082f9d5b68aa8ea7f4363002f7483656c46f58af';
      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);

      const inputData =
        functionSelector + // 4
        lockId + // 36
        fromToken + // 68
        bytesReceiver + // 100
        paddedChainData + // destinationChain 132
        amountInBytes; // 164

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    // Left padded EVM addresses: https://etherscan.io/tx/0xb2e2e2cafcfa603d5a2add91453df17565e8cbfee0a7fdc842e56ee13b8a3caf
    it('Should bridge USDC on Portal', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = '10000000';
      const command = '0x0e1024';
      const functionSelector = '0x0f5287b0'; // transferTokens()

      const toChainId = '000000000000000000000000000000000000000000000000000000000000a4b1'; // Chain: 42161 (Arbitrum)
      const receiver = addressPadding + swapAccount.slice(2);
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000000989680'; // 10000000
      const arbiterFee = '0000000000000000000000000000000000000000000000000000000000000000';

      // Resource for in-contract data calculation
      // https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/coreRelayer/CoreRelayer.sol

      const inputData =
        functionSelector +
        fromToken + // 4
        amount + // 36
        toChainId + // 68
        receiver + // 100
        arbiterFee; // 132

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should bridge USDC on Optimism', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = '10000000';
      const command = '0x0f1064';
      const functionSelector = '0x838b2520'; // depositERC20To()
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const L2Token = addressPadding + OPTIMISM_USDC_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);

      const adjustedL2Gas = ethers.BigNumber.from(2000000);
      // Gas limit required to complete the deposit on L2
      const L2Gas = ethers.utils.hexZeroPad(adjustedL2Gas.toHexString(), 32).slice(2);
      const encodedData =
        '00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000';

      const inputData =
        functionSelector +
        fromToken +
        L2Token +
        addressPadding +
        swapAccount.slice(2) +
        amountInBytes +
        L2Gas +
        encodedData;

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should bridge USDC on Polygon Bridge', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = '10000000';
      const command = '0x103084';
      const functionSelector = '0xe3dec8fb'; // depositFor()

      const receiver = addressPadding + swapAccount.slice(2);
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const dataLocation = '0000000000000000000000000000000000000000000000000000000000000060';
      const dataLength = '0000000000000000000000000000000000000000000000000000000000000020';
      const amount = '0000000000000000000000000000000000000000000000000000000000989680'; // 10000000 - name is data on contract

      const inputData =
        functionSelector +
        receiver + // 4
        fromToken + // 36
        dataLocation + // 68
        dataLength + // 100
        amount; // 132

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should bridge USDC on Omni Bridge', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const amountIn = '10000000';
      const command = '0x111044';
      const functionSelector = '0xad58bdd1'; // relayTokens()

      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000000989680'; // 10000000 - name is data on contract

      const inputData =
        functionSelector + // 0
        fromToken + // 4
        receiver + // 36
        amount; // 68

      await universalRouter
        .connect(signer)
        .singleExecute(command, inputData, { gasLimit: 1000000 });

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });
  });

  describe('Bridge ETH', function () {
    it('Should bridge ETH on Hop', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      const command = '0x06E444';
      const functionSelector = '0xdeace8f5'; // sendToL2()

      const amountIn = ethers.BigNumber.from('1000000000000000');
      const amountOutMin = 10000;
      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);

      const amountOutBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const chainId = 42161; // Chain: 42161 (Arbitrum)
      const chainIdBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(chainId), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); //
      const relayerAddress = '0xa6a688F107851131F0E1dce493EbBebFAf99203e';
      const relayer = addressPadding + relayerAddress.slice(2);
      const relayerFee = '0000000000000000000000000000000000000000000000000000000000000000'; // Set to zero on Hop tx's

      const inputData =
        functionSelector + // 4
        chainIdBytes + // 36
        receiver + // 68
        amountInBytes + // 100
        amountOutBytes + // 132
        timestamp.slice(2) + // 164
        relayer + // 196
        relayerFee + // 228
        '00';

      const tx = await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: amountIn,
      });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        '0',
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should bridge ETH on Hyphen', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      const command = '0x0d0000';
      const functionSelector = '0xea368421'; // depositNative()

      const amountIn = ethers.BigNumber.from('100000000000000000');
      const chainId = 56;
      const chainIdBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(chainId), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const stringSlot = '0000000000000000000000000000000000000000000000000000000000000060';
      const stringLength = '0000000000000000000000000000000000000000000000000000000000000009'; // 9 characters
      const string = hre.ethers.utils.formatBytes32String('Sideshift'); // Sideshift
      const inputData =
        functionSelector + receiver + chainIdBytes + stringSlot + stringLength + string.slice(2);

      const tx = await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: amountIn,
      });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        '0',
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should bridge ETH on Celer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      const command = '0x083024';
      const functionSelector = '0x3f2e5fc3'; // sendNative()

      const amountIn = ethers.BigNumber.from('100000000000000000');
      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);

      const chainId = 56; // Chain: 56 (BSC)
      const chainIdBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(chainId), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const nonce = '0000000000000000000000000000000000000000000000000000018a62abddd9'; // Timestamp of: 200642000
      const maxSlippage = '000000000000000000000000000000000000000000000000000000000000c350'; // 50,000 (0.5%)

      const inputData =
        functionSelector + receiver + amountInBytes + chainIdBytes + nonce + maxSlippage;

      const tx = await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: amountIn,
      });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        '0',
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should bridge ETH on Across', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      const command = '0x073044';
      const functionSelector = '0x49228978'; // deposit()

      const amountIn = ethers.BigNumber.from('1000000000000000');
      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);

      const chainId = '42161'; // Chain: 42161 (Arbitrum)
      const adjustedChainId = ethers.BigNumber.from(chainId);
      const chainIdBytes = ethers.utils.hexZeroPad(adjustedChainId.toHexString(), 32).slice(2);

      const tokenAddress = addressPadding + WETH_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); // Needs to be a timestamp within 3600 seconds of current time
      const relayerFee = '0000000000000000000000000000000000000000000000000000835e50958811'; // Typically 0.06 - 0.12% of transaction - rand value used here of 144441102141457

      const inputData =
        functionSelector +
        receiver +
        tokenAddress +
        amountInBytes +
        chainIdBytes +
        relayerFee +
        timestamp.slice(2);

      const tx = await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: amountIn,
      });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        '0',
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should bridge ETH on Multichain', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      const command = '0x0c9000';
      const functionSelector = '0xa5e56571'; // anySwapOutNative()

      const amountIn = '1';
      const numerator = ethers.BigNumber.from(10).pow(17);
      const adjustedAmountIn = ethers.BigNumber.from(amountIn).mul(numerator).mul(9998).div(10000);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedSendAmount = ethers.BigNumber.from(amountIn).mul(numerator);

      const chainId = '42161'; // Chain: 42161 (Arbitrum)
      const adjustedChainId = ethers.BigNumber.from(chainId);
      const chainIdBytes = ethers.utils.hexZeroPad(adjustedChainId.toHexString(), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const anyToken = addressPadding + ANY_ETH_ADDRESS.slice(2); // Must specific the anyToken in the call

      const inputData = functionSelector + anyToken + receiver + chainIdBytes;

      const tx = await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: adjustedSendAmount,
      });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        adjustedSendAmount.toString(),
        txCost,
        '0',
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should bridge ETH on Synapse', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      const command = '0x095044';
      const functionSelector = '0xce0b63ce'; // depositETH()

      const amountIn = ethers.BigNumber.from('1000000000000000');
      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);

      const chainId = '42161'; // Chain: 42161 (Arbitrum)
      const adjustedChainId = ethers.BigNumber.from(chainId);
      const chainIdBytes = ethers.utils.hexZeroPad(adjustedChainId.toHexString(), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);

      const inputData =
        functionSelector +
        receiver + // 4
        chainIdBytes + // 36
        amountInBytes; // 68

      const tx = await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: amountIn,
      });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        '0',
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    // Right padding for recipient example: https://etherscan.io/tx/0xc9f0ccd28b23ccc9cc2bd0bd6803d97766b06cf50a02067c892181e346291b5c
    // Right padding for chainId
    it('Should bridge ETH on AllBridge', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const command = '0x0b3084';
      const functionSelector = '0x5e3b0f9e'; // lockBase()

      const amountIn = ethers.BigNumber.from('10000000000000000');

      // ERROR: LockId already exists
      const randLockId = ethers.BigNumber.from('1393486301498661656195974995341829849');
      const lockId = ethers.utils.hexZeroPad(ethers.utils.hexlify(randLockId), 32).slice(2);
      const paddedChainData = '534f4c0000000000000000000000000000000000000000000000000000000000'; // Chain: 42161 (Arbitrum)
      const bytesReceiver = swapAccount.slice(2) + addressPadding;
      const fromToken = addressPadding + WETH_ADDRESS.slice(2);

      // const destChainBytes = "54455a00";
      // const paddedChainId = destChainBytes.padEnd(64, "0");

      const inputData =
        functionSelector + // 4
        lockId + // 36
        fromToken + // 68
        bytesReceiver + // 100
        paddedChainData; // destinationChain 132

      await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: amountIn,
      });

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    // Left padded EVM addresses: https://etherscan.io/tx/0xb2e2e2cafcfa603d5a2add91453df17565e8cbfee0a7fdc842e56ee13b8a3caf
    it('Should bridge ETH on Portal', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      const command = '0x0e0000';
      const functionSelector = '0x9981509f'; // wrapAndTransferETH()

      const amountIn = '1';
      const numerator = ethers.BigNumber.from(10).pow(17);
      const adjustedSendAmount = ethers.BigNumber.from(amountIn).mul(numerator);

      const chainId = '42161'; // Chain: 42161 (Arbitrum)
      const adjustedChainId = ethers.BigNumber.from(chainId);
      const chainIdBytes = ethers.utils.hexZeroPad(adjustedChainId.toHexString(), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const arbiterFee = '0000000000000000000000000000000000000000000000000000000000000000';
      const nonce = '000000000000000000000000000000000000000000000000000000000bf58dd0'; // Timestamp of: 200642000

      // Resource for in-contract data calculation
      // https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/coreRelayer/CoreRelayer.sol
      const inputData = functionSelector + chainIdBytes + receiver + arbiterFee + nonce;

      const tx = await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: adjustedSendAmount,
      });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        adjustedSendAmount.toString(),
        txCost,
        '0',
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should bridge ETH on Optimism', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      const command = '0x0f1064';
      const functionSelector = '0x9a2ac6d5'; // depositETHTo()

      const amountIn = '1';
      const numerator = ethers.BigNumber.from(10).pow(17);
      const adjustedSendAmount = ethers.BigNumber.from(amountIn).mul(numerator);

      const adjustedL2Gas = ethers.BigNumber.from(2000000);
      // Gas limit required to complete the deposit on L2
      const L2Gas = ethers.utils.hexZeroPad(adjustedL2Gas.toHexString(), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const encodedData =
        '00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000';

      const inputData = functionSelector + receiver + L2Gas + encodedData;

      const tx = await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: adjustedSendAmount,
      });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        adjustedSendAmount.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should bridge ETH on Polygon Bridge', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));

      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      const command = '0x103084';
      const functionSelector = '0x4faa8a26'; // depositEtherFor()

      const amountIn = '1';
      const numerator = ethers.BigNumber.from(10).pow(17);
      const adjustedSendAmount = ethers.BigNumber.from(amountIn).mul(numerator);
      const receiver = addressPadding + swapAccount.slice(2);

      const inputData = functionSelector + receiver;

      const tx = await universalRouter.connect(signer).singleExecute(command, inputData, {
        gasLimit: 1000000,
        value: adjustedSendAmount,
      });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        adjustedSendAmount.toString(),
        txCost,
        '0',
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });
  });

  describe('Swap and Bridge ERC20 tokens', function () {
    it('Should swap USDT to USDC on UniV2 and bridge USDC on Hyphen', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x014000';
      const hyphenCommand = '0x0d3064';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDT_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0x55d73595'; // depositErc20()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(56), 32).slice(2);
      const tokenAddress = addressPadding + USDC_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const stringSlot = '00000000000000000000000000000000000000000000000000000000000000a0';
      const stringLength = '0000000000000000000000000000000000000000000000000000000000000009'; // 9 characters
      const string = hre.ethers.utils.formatBytes32String('Sideshift'); // Sideshift
      const hyphenBytesData =
        functionSelector +
        toChainId +
        tokenAddress +
        receiver +
        amountInBytes +
        stringSlot +
        stringLength +
        string.slice(2);

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, hyphenCommand], [uniBytesData, hyphenBytesData]);

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should multiswap USDT to USDC on UniV2 and bridge USDC on Celer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = '100000000';
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const celerCommand = '0x083044';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = USDT_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0xa5977fbb'; // depositErc20()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(56), 32).slice(2);
      const tokenAddress = addressPadding + USDC_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const nonce = ethers.utils.hexZeroPad(ethers.utils.hexlify(200642000), 32).slice(2); // Timestamp of: 200642000
      const maxSlippage = ethers.utils.hexZeroPad(ethers.utils.hexlify(50000), 32).slice(2); // 50,000 (0.5%)

      const celerBytesData =
        functionSelector +
        receiver +
        tokenAddress +
        amountInBytes +
        toChainId +
        nonce +
        maxSlippage;

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, celerCommand], [uniBytesData, celerBytesData]);

      await checkBridgeChange(
        signer,
        amountIn,
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to USDC on Sushi and bridge USDC on Multichain', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = 100000000;
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const multichainCommand = '0x0c9044';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const functionSelector = '0xedbdf5e2'; // anySwapOutUnderlying()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(42161), 32).slice(2);
      const amount = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const anyToken = addressPadding + ANY_USDC_ADDRESS.slice(2); // Must specific the anyToken in the call
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);

      const multichainBytesData =
        functionSelector +
        anyToken + // 4
        receiver + // 68
        amount + // 100
        toChainId +
        fromToken;

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, multichainCommand], [sushiBytesData, multichainBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to USDC on Sushi and bridge USDC on Synapse', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = 100000000;
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const synapseCommand = '0x095064';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const functionSelector = '0x90d25074'; // deposit()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(42161), 32).slice(2);
      const amount = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);

      const synapseBytesData =
        functionSelector +
        receiver + // 4
        toChainId + // 36
        fromToken + // 68
        amount + // 100
        fromToken;

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, synapseCommand], [sushiBytesData, synapseBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to USDC on UniV3 and bridge USDC on Hop', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = 100000000;
      amountOutMin = 1000000;

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const uniV3Command = '0x024000';
      const hopCommand = '0x06E444';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 100;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDT_ADDRESS.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0xdeace8f5'; // sendToL2()
      const toChainId = '000000000000000000000000000000000000000000000000000000000000a4b1'; // Chain: 42161 (Arbitrum)
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000000989680';
      const amountOut = '00000000000000000000000000000000000000000000000000000000000f4240';
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); //
      const relayerAddress = '0xa6a688F107851131F0E1dce493EbBebFAf99203e';
      const relayer = addressPadding + relayerAddress.slice(2);
      const relayerFee = '0000000000000000000000000000000000000000000000000000000000000000'; // Set to zero on Hop tx's

      const hopBytesData =
        functionSelector + // 4
        toChainId + // 36
        receiver + // 68
        amount + // 100
        amountOut + // 132
        timestamp.slice(2) + // 164
        relayer + // 196
        relayerFee + // 228
        USDC_ADDRESS.slice(2) + // 248
        '01';

      await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, hopCommand], [uniV3BytesData, hopBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to USDC on UniV3 and bridge USDC on Across', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = 100000000;
      amountOutMin = 1000000;

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const uniV3Command = '0x024000';
      const acrossCommand = '0x073044';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 100;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDT_ADDRESS.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0x49228978'; // deposit()
      const toChainId = '000000000000000000000000000000000000000000000000000000000000a4b1'; // Chain: 42161 (Arbitrum)
      const tokenAddress = addressPadding + WETH_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '000000000000000000000000000000000000000000000000002386f26fc10000';
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); // Needs to be a timestamp within 3600 seconds of current time
      const relayerFee = '0000000000000000000000000000000000000000000000000000835e50958811'; // Typically 0.06 - 0.12% of transaction - rand value used here of 144441102141457

      const acrossBytesData =
        functionSelector +
        receiver +
        tokenAddress +
        amount +
        toChainId +
        relayerFee +
        timestamp.slice(2);

      await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, acrossCommand], [uniV3BytesData, acrossBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap WETH to USDC on Balancer and bridge USDC on Portal', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const balancerCommand = '0x440000';
      const portalCommand = '0x0e1024';

      amountIn = '10000000000000000';
      amountOutMin = '1000';
      const poolId = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);

      const singleSwap = [poolId, 0, WETH_ADDRESS, USDC_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, universalRouter.address, false];

      const balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const functionSelector = '0x0f5287b0'; // transferTokens()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(42161), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const arbiterFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(0), 32).slice(2);

      // Resource for in-contract data calculation
      // https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/coreRelayer/CoreRelayer.sol

      const portalBytesData =
        functionSelector +
        fromToken + // 4
        amountInBytes + // 36
        toChainId + // 68
        receiver + // 100
        arbiterFee; // 132

      await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, portalCommand], [balancerBytesData, portalBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap WETH to USDC on Balancer and bridge USDC on Optimism', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDT_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      const balancerCommand = '0x440000'; // Changed to 58 from 48
      const optimismCommand = '0x0f1064';

      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = '1000';
      const poolId = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);

      const singleSwap = [poolId, 0, WETH_ADDRESS, USDC_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, universalRouter.address, false];

      const balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const functionSelector = '0x838b2520'; // depositERC20To()
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const L2Token = addressPadding + OPTIMISM_USDC_ADDRESS.slice(2);

      const L2Gas = ethers.utils.hexZeroPad(ethers.utils.hexlify(2000000), 32).slice(2); // Gas limit required to complete the deposit on L2
      const encodedData =
        '00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000';

      const optimismBytesData =
        functionSelector +
        fromToken +
        L2Token +
        addressPadding +
        swapAccount.slice(2) +
        amountInBytes +
        L2Gas +
        encodedData;

      await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, optimismCommand], [balancerBytesData, optimismBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to USDC on Curve and bridge USDC on Polygon', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDT_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      amountIn = 100000000;
      amountOutMin = 100000;

      // Chained used 0x40 for mask: 0100 0000
      // Curve is 07 - Masking 0x07 becomes 0x47
      const curveCommand = '0x430014';
      const polygonCommand = '0x103084';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const pair = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const i = ethers.utils.hexZeroPad(ethers.utils.hexlify(2), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.utils.hexlify(1), 1).slice(2);
      const fromToken = USDT_ADDRESS;
      const toToken = USDC_ADDRESS.slice(2);

      const functionSelector = '3df02124';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const polyFunctionSelector = '0xe3dec8fb'; // depositFor()

      const receiver = addressPadding + swapAccount.slice(2);
      const polyFromToken = addressPadding + USDC_ADDRESS.slice(2);
      const dataLocation = '0000000000000000000000000000000000000000000000000000000000000060';
      const dataLength = '0000000000000000000000000000000000000000000000000000000000000020';

      const polygonBytesData =
        polyFunctionSelector +
        receiver + // 4
        polyFromToken + // 36
        dataLocation + // 68
        dataLength + // 100
        amountInBytes; // 132

      await universalRouter
        .connect(signer)
        .multiExecute([curveCommand, polygonCommand], [curveBytesData, polygonBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to USDC on Curve and bridge USDC on OmniBridge', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDT_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      amountIn = 100000000;
      amountOutMin = 100000;

      // Chained used 0x40 for mask: 0100 0000
      // Curve is 07 - Masking 0x07 becomes 0x47
      const curveCommand = '0x430014';
      const omniCommand = '0x111044';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const pair = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const i = ethers.utils.hexZeroPad(ethers.utils.hexlify(2), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.utils.hexlify(1), 1).slice(2);
      const fromToken = USDT_ADDRESS;
      const toToken = USDC_ADDRESS.slice(2);

      const functionSelector = '3df02124';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const omniFunctionSelector = '0xad58bdd1'; // relayTokens()
      const omniFromToken = addressPadding + USDC_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000000989680'; // 10000000 - name is data on contract

      const omniBytesData =
        omniFunctionSelector + // 0
        omniFromToken + // 4
        receiver + // 36
        amount; // 68

      await universalRouter
        .connect(signer)
        .multiExecute([curveCommand, omniCommand], [curveBytesData, omniBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });
  });

  describe('Swap from ETH and Bridge ERC20 tokens', function () {
    it('Should swap ETH to USDC on UniV2 and bridge USDC on Hyphen', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x014000';
      const hyphenCommand = '0x0d3064';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = ethers.constants.AddressZero.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0x55d73595'; // depositErc20()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(56), 32).slice(2);
      const tokenAddress = addressPadding + USDC_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const stringSlot = '00000000000000000000000000000000000000000000000000000000000000a0';
      const stringLength = '0000000000000000000000000000000000000000000000000000000000000009'; // 9 characters
      const string = hre.ethers.utils.formatBytes32String('Sideshift'); // Sideshift
      const hyphenBytesData =
        functionSelector +
        toChainId +
        tokenAddress +
        receiver +
        amountInBytes +
        stringSlot +
        stringLength +
        string.slice(2);

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, hyphenCommand], [uniBytesData, hyphenBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should multiswap ETH to USDC on UniV2 and bridge USDC on Celer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = ethers.BigNumber.from('100000000000000000');
      amountOutMin = '100000';

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x414000';
      const celerCommand = '0x083044';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const data = ethers.constants.AddressZero.slice(2) + USDC_ADDRESS.slice(2);

      // NOTE: Final byte set to 1 to specify recipient is not msg.sender and should be recipient added at length - 22
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0xa5977fbb'; // depositErc20()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(56), 32).slice(2);
      const tokenAddress = addressPadding + USDC_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const nonce = ethers.utils.hexZeroPad(ethers.utils.hexlify(200642000), 32).slice(2); // Timestamp of: 200642000
      const maxSlippage = ethers.utils.hexZeroPad(ethers.utils.hexlify(50000), 32).slice(2); // 50,000 (0.5%)

      const celerBytesData =
        functionSelector +
        receiver +
        tokenAddress +
        amountInBytes +
        toChainId +
        nonce +
        maxSlippage;

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, celerCommand], [uniBytesData, celerBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on Sushi and bridge USDC on Multichain', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = ethers.BigNumber.from('100000000000000000');
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const multichainCommand = '0x0c9044';

      let sushiBytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDC_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const functionSelector = '0xedbdf5e2'; // anySwapOutUnderlying()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(42161), 32).slice(2);
      const amount = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const anyToken = addressPadding + ANY_USDC_ADDRESS.slice(2); // Must specific the anyToken in the call
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);

      const multichainBytesData =
        functionSelector +
        anyToken + // 4
        receiver + // 68
        amount + // 100
        toChainId +
        fromToken;

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, multichainCommand], [sushiBytesData, multichainBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on Sushi and bridge USDC on Synapse', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = ethers.BigNumber.from('100000000000000000');
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const synapseCommand = '0x095064';

      let sushiBytesData = iface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        [WETH_ADDRESS, USDC_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const functionSelector = '0x90d25074'; // deposit()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(42161), 32).slice(2);
      const amount = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);

      const synapseBytesData =
        functionSelector +
        receiver + // 4
        toChainId + // 36
        fromToken + // 68
        amount + // 100
        fromToken;

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, synapseCommand], [sushiBytesData, synapseBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on UniV3 and bridge USDC on Hop', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = ethers.BigNumber.from('100000000000000000');
      amountOutMin = 1000000;

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const uniV3Command = '0x024000';
      const hopCommand = '0x06E444';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 100;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = ethers.constants.AddressZero.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0xdeace8f5'; // sendToL2()
      const toChainId = '000000000000000000000000000000000000000000000000000000000000a4b1'; // Chain: 42161 (Arbitrum)
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000000989680';
      const amountOut = '00000000000000000000000000000000000000000000000000000000000f4240';
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); //
      const relayerAddress = '0xa6a688F107851131F0E1dce493EbBebFAf99203e';
      const relayer = addressPadding + relayerAddress.slice(2);
      const relayerFee = '0000000000000000000000000000000000000000000000000000000000000000'; // Set to zero on Hop tx's

      const hopBytesData =
        functionSelector + // 4
        toChainId + // 36
        receiver + // 68
        amount + // 100
        amountOut + // 132
        timestamp.slice(2) + // 164
        relayer + // 196
        relayerFee + // 228
        USDC_ADDRESS.slice(2) + // 248
        '01';

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, hopCommand], [uniV3BytesData, hopBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on UniV3 and bridge USDC on Across', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDC_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      amountIn = ethers.BigNumber.from('100000000000000000');
      amountOutMin = 1000000;

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const uniV3Command = '0x024000';
      const acrossCommand = '0x073044';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 100;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = ethers.constants.AddressZero.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0x49228978'; // deposit()
      const toChainId = '000000000000000000000000000000000000000000000000000000000000a4b1'; // Chain: 42161 (Arbitrum)
      const tokenAddress = addressPadding + WETH_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '000000000000000000000000000000000000000000000000002386f26fc10000';
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); // Needs to be a timestamp within 3600 seconds of current time
      const relayerFee = '0000000000000000000000000000000000000000000000000000835e50958811'; // Typically 0.06 - 0.12% of transaction - rand value used here of 144441102141457

      const acrossBytesData =
        functionSelector +
        receiver +
        tokenAddress +
        amount +
        toChainId +
        relayerFee +
        timestamp.slice(2);

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, acrossCommand], [uniV3BytesData, acrossBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on Balancer and bridge USDC on Portal', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDT_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      const balancerCommand = '0x440000';
      const portalCommand = '0x0e1024';

      amountIn = ethers.BigNumber.from('100000000000000000');
      amountOutMin = '1000';
      const poolId = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);

      const singleSwap = [poolId, 0, ethers.constants.AddressZero, USDC_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, universalRouter.address, false];

      const balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const functionSelector = '0x0f5287b0'; // transferTokens()
      const toChainId = ethers.utils.hexZeroPad(ethers.utils.hexlify(42161), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const arbiterFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(0), 32).slice(2);

      // Resource for in-contract data calculation
      // https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/coreRelayer/CoreRelayer.sol

      const portalBytesData =
        functionSelector +
        fromToken + // 4
        amountInBytes + // 36
        toChainId + // 68
        receiver + // 100
        arbiterFee; // 132

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, portalCommand], [balancerBytesData, portalBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDC on Balancer and bridge USDC on Optimism', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, USDT_ADDRESS));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, token1Contract));

      const balancerCommand = '0x440000'; // Changed to 58 from 48
      const optimismCommand = '0x0f1064';

      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = '1000';
      const poolId = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);

      const singleSwap = [poolId, 0, ethers.constants.AddressZero, USDC_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, universalRouter.address, false];

      const balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      const functionSelector = '0x838b2520'; // depositERC20To()
      const fromToken = addressPadding + USDC_ADDRESS.slice(2);
      const L2Token = addressPadding + OPTIMISM_USDC_ADDRESS.slice(2);

      const L2Gas = ethers.utils.hexZeroPad(ethers.utils.hexlify(2000000), 32).slice(2); // Gas limit required to complete the deposit on L2
      const encodedData =
        '00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000';

      const optimismBytesData =
        functionSelector +
        fromToken +
        L2Token +
        addressPadding +
        swapAccount.slice(2) +
        amountInBytes +
        L2Gas +
        encodedData;

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([balancerCommand, optimismCommand], [balancerBytesData, optimismBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on Curve and bridge USDT on Polygon', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = 100000;

      // Chained used 0x40 for mask: 0100 0000
      // Curve is 07 - Masking 0x07 becomes 0x47
      const curveCommand = '0x430014';
      const polygonCommand = '0x103084';

      const pair = '0xd51a44d3fae010294c616388b506acda1bfaae46';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const fromToken = ethers.constants.AddressZero;
      const toToken = USDT_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const functionSelector = '394747c5';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const polyFunctionSelector = '0xe3dec8fb'; // depositFor()

      const receiver = addressPadding + swapAccount.slice(2);
      const polyFromToken = addressPadding + USDT_ADDRESS.slice(2);
      const dataLocation = '0000000000000000000000000000000000000000000000000000000000000060';
      const dataLength = '0000000000000000000000000000000000000000000000000000000000000020';

      const polygonBytesData =
        polyFunctionSelector +
        receiver + // 4
        polyFromToken + // 36
        dataLocation + // 68
        dataLength + // 100
        amountInBytes; // 132

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([curveCommand, polygonCommand], [curveBytesData, polygonBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });

    it('Should swap ETH to USDT on Curve and bridge USDT on OmniBridge', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, 0, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, 0, 0));

      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = 100000;

      // Chained used 0x40 for mask: 0100 0000
      // Curve is 07 - Masking 0x07 becomes 0x47
      const curveCommand = '0x430014';
      const omniCommand = '0x111044';

      const pair = '0xd51a44d3fae010294c616388b506acda1bfaae46';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const fromToken = ethers.constants.AddressZero;
      const toToken = USDT_ADDRESS.slice(2);

      const adjustedAmountIn = ethers.BigNumber.from(amountIn);
      const amountInBytes = ethers.utils.hexZeroPad(adjustedAmountIn.toHexString(), 32).slice(2);
      const adjustedAmountOut = ethers.BigNumber.from(amountOutMin);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(adjustedAmountOut.toHexString(), 32)
        .slice(2);

      const functionSelector = '394747c5';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const omniFunctionSelector = '0xad58bdd1'; // relayTokens()
      const omniFromToken = addressPadding + USDT_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const amount = '0000000000000000000000000000000000000000000000000000000000989680'; // 10000000 - name is data on contract

      const omniBytesData =
        omniFunctionSelector + // 0
        omniFromToken + // 4
        receiver + // 36
        amount; // 68

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([curveCommand, omniCommand], [curveBytesData, omniBytesData], {
          value: amountIn,
        });
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        'fromETH'
      );
    });
  });

  describe('Swap to ETH and Bridge', function () {
    it('Should swap USDC to ETH on UniV2 and bridge ETH on Hyphen', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      ({ approveTxCost } = await approveERC20(
        signer,
        token0Contract,
        universalRouter,
        token0Balance
      ));

      amountIn = 250000000;
      amountOutMin = 100000;

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x014000';
      const hyphenCommand = '0x2d0000';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const data = USDC_ADDRESS.slice(2) + WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient (2 bytes);
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        '01' +
        universalRouter.address.slice(2) +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0xea368421'; // depositNative()
      const chainId = 56;
      const chainIdBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(chainId), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const stringSlot = '0000000000000000000000000000000000000000000000000000000000000060';
      const stringLength = '0000000000000000000000000000000000000000000000000000000000000009'; // 9 characters
      const string = hre.ethers.utils.formatBytes32String('Sideshift'); // Sideshift
      const hyphenBytesData =
        functionSelector + receiver + chainIdBytes + stringSlot + stringLength + string.slice(2);

      const tx = await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, hyphenCommand], [uniBytesData, hyphenBytesData]);
      const { txCost } = await getTxCost(tx);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should multiswap USDC to ETH on UniV2 and bridge ETH on Celer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      amountIn = 100000000;
      amountOutMin = 100000;

      // Chained used 0x40 for mask: 0100 0000
      // UniV2 is 0 - Masking 0x00 becomes 0x40
      const uniCommand = '0x014000';
      const celerCommand = '0x283024';

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const data = USDC_ADDRESS.slice(2) + WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient (2 bytes);
      const uniBytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        data +
        '01' +
        universalRouter.address.slice(2) +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0x3f2e5fc3'; // sendNative()
      const chainId = 56; // Chain: 56 (BSC)
      const chainIdBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(chainId), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const nonce = '0000000000000000000000000000000000000000000000000000018a62abddd9'; // Timestamp of: 200642000
      const maxSlippage = '000000000000000000000000000000000000000000000000000000000000c350'; // 50,000 (0.5%)

      const celerBytesData =
        functionSelector + receiver + amountInBytes + chainIdBytes + nonce + maxSlippage;

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, celerCommand], [uniBytesData, celerBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to ETH on Sushi and bridge ETH on Multichain', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDT_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = 100000000;
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const multichainCommand = '0x2c9044';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForETH', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, WETH_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const functionSelector = '0xa5e56571'; // anySwapOutNative()
      const chainId = '42161'; // Chain: 42161 (Arbitrum)
      const adjustedChainId = ethers.BigNumber.from(chainId);
      const chainIdBytes = ethers.utils.hexZeroPad(adjustedChainId.toHexString(), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const anyToken = addressPadding + ANY_ETH_ADDRESS.slice(2); // Must specific the anyToken in the call

      const multichainBytesData = functionSelector + anyToken + receiver + chainIdBytes;

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, multichainCommand], [sushiBytesData, multichainBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to ETH on Sushi and bridge ETH on Synapse', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      amountIn = 100000000;
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const sushiCommand = '0x40d004';
      const synapseCommand = '0x290044';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForETH', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, WETH_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const functionSelector = '0xce0b63ce'; // depositETH()
      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);

      const chainId = '42161'; // Chain: 42161 (Arbitrum)
      const adjustedChainId = ethers.BigNumber.from(chainId);
      const chainIdBytes = ethers.utils.hexZeroPad(adjustedChainId.toHexString(), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);

      const synapseBytesData =
        functionSelector +
        receiver + // 4
        chainIdBytes + // 36
        amountInBytes; // 68

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, synapseCommand], [sushiBytesData, synapseBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDC to ETH on UniV3 and bridge ETH on Hop', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const uniV3Command = '0x424000';
      const hopCommand = '0x26E444';

      amountIn = 10000000;
      amountOutMin = 1000000000000;

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 500;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDC_ADDRESS.slice(2) + encodedFee + WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        '01' +
        universalRouter.address.slice(2) +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0xdeace8f5'; // sendToL2()
      const chainId = 42161; // Chain: 42161 (Arbitrum)
      const chainIdBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(chainId), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); //
      const relayerAddress = '0xa6a688F107851131F0E1dce493EbBebFAf99203e';
      const relayer = addressPadding + relayerAddress.slice(2);
      const relayerFee = '0000000000000000000000000000000000000000000000000000000000000000'; // Set to zero on Hop tx's

      const hopBytesData =
        functionSelector + // 4
        chainIdBytes + // 36
        receiver + // 68
        amountInBytes + // 100
        amountOutMinBytes + // 132
        timestamp.slice(2) + // 164
        relayer + // 196
        relayerFee + // 228
        '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, hopCommand], [uniV3BytesData, hopBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDC to ETH on UniV3 and bridge ETH on Across', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDC_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      const uniV3Command = '0x024000';
      const acrossCommand = '0x273044';

      amountIn = 10000000;
      amountOutMin = 1000000000000;

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 500;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDC_ADDRESS.slice(2) + encodedFee + WETH_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData =
        '0x' +
        amountInBytes +
        amountOutMinBytes +
        pathData +
        '01' +
        universalRouter.address.slice(2) +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const functionSelector = '0x49228978'; // deposit()
      const chainId = '42161'; // Chain: 42161 (Arbitrum)
      const adjustedChainId = ethers.BigNumber.from(chainId);
      const chainIdBytes = ethers.utils.hexZeroPad(adjustedChainId.toHexString(), 32).slice(2);

      const tokenAddress = addressPadding + WETH_ADDRESS.slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const blockTimestamp = await ethers.provider
        .getBlock('latest')
        .then(block => block.timestamp + 60 * 10);
      const timestamp = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockTimestamp), 32); // Needs to be a timestamp within 3600 seconds of current time
      const relayerFee = '0000000000000000000000000000000000000000000000000000835e50958811'; // Typically 0.06 - 0.12% of transaction - rand value used here of 144441102141457

      const acrossBytesData =
        functionSelector +
        receiver +
        tokenAddress +
        amountInBytes +
        chainIdBytes +
        relayerFee +
        timestamp.slice(2);

      await universalRouter
        .connect(signer)
        .multiExecute([uniV3Command, acrossCommand], [uniV3BytesData, acrossBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to ETH on Sushi and bridge ETH on Portal', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDT_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      amountIn = 100000000;
      amountOutMin = '1000000';

      const sushiCommand = '0x40d004';
      const portalCommand = '0x2e0000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForETH', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, WETH_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const functionSelector = '0x9981509f'; // wrapAndTransferETH()
      const chainId = 42161; // Chain: 42161 (Arbitrum)
      const chainIdBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(chainId), 32).slice(2);

      const receiver = addressPadding + swapAccount.slice(2);
      const arbiterFee = '0000000000000000000000000000000000000000000000000000000000000000';
      const nonce = '000000000000000000000000000000000000000000000000000000000bf58dd0'; // Timestamp of: 200642000

      // Resource for in-contract data calculation
      // https://github.com/wormhole-foundation/trustless-generic-relayer/blob/main/ethereum/contracts/coreRelayer/CoreRelayer.sol
      const portalBytesData = functionSelector + chainIdBytes + receiver + arbiterFee + nonce;

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, portalCommand], [sushiBytesData, portalBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to ETH on Sushi and bridge ETH on Optimism', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDT_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      const sushiCommand = '0x40d004';
      const optimismCommand = '0x2f1064';

      amountIn = 100000000;
      amountOutMin = '1000000';

      // Chained used 0x40 for mask: 0100 0000
      // Sushi is 0x02 - Masking 0x02 becomes 0x42
      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForETH', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, WETH_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      const functionSelector = '0x9a2ac6d5'; // depositETHTo()
      // Gas limit required to complete the deposit on L2
      const L2Gas = ethers.utils.hexZeroPad(ethers.utils.hexlify(2000000), 32).slice(2);
      const receiver = addressPadding + swapAccount.slice(2);
      const encodedData =
        '00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000';

      const optimismBytesData = functionSelector + receiver + L2Gas + encodedData;

      await universalRouter
        .connect(signer)
        .multiExecute([sushiCommand, optimismCommand], [sushiBytesData, optimismBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });

    it('Should swap USDT to ETH on Curve and bridge ETH on Polygon', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(signer, USDT_ADDRESS, 0));
      ({ token0Balance, token1Balance } = await getBalances(signer, token0Contract, 0));

      amountIn = 100000000;
      amountOutMin = 100000;

      // Chained used 0x40 for mask: 0100 0000
      // Curve is 07 - Masking 0x07 becomes 0x47
      const curveCommand = '0x030014';
      const polygonCommand = '0x303084';
      const pair = '0xd51a44d3fae010294c616388b506acda1bfaae46';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('0').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const fromToken = USDT_ADDRESS;
      const toToken = ethers.constants.AddressZero.slice(2);

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const functionSelector = '394747c5';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        universalRouter.address.slice(2) +
        '01' +
        '01';

      const polyFunctionSelector = '0x4faa8a26'; // depositEtherFor()
      const receiver = addressPadding + swapAccount.slice(2);
      const polygonBytesData = polyFunctionSelector + receiver;

      await universalRouter
        .connect(signer)
        .multiExecute([curveCommand, polygonCommand], [curveBytesData, polygonBytesData]);

      await checkBridgeChange(
        signer,
        amountIn.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token0Contract,
        null
      );
    });
  });

  describe('Split orders', function () {
    it('Should split order USDT to USDC on UniV2 and USDT to USDC on Sushi', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const uniCommand = '0x414000';
      const sushiCommand = '0x40d004';

      amountIn = 100000000;
      amountOutMin = 1000000;

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);
      const data = USDT_ADDRESS.slice(2) + USDC_ADDRESS.slice(2);
      const uniBytesData = '0x' + amountInBytes + amountOutMinBytes + data + '01' + '00';

      let sushiBytesData = iface.encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, USDC_ADDRESS],
        universalRouter.address,
        deadline,
      ]);
      sushiBytesData = sushiBytesData + '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniCommand, sushiCommand], [uniBytesData, sushiBytesData]);

      amountIn = amountIn * 2;
      amountOutMin = amountOutMin * 2;

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should split order USDT to USDC on UniV3 and USDT to USDC on Curve', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        USDT_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const uniV3command = '0x024000';
      const curveCommand = '0x430014';

      amountIn = 100000000;
      amountOutMin = 1000000;

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 100;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = USDT_ADDRESS.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData = '0x' + amountInBytes + amountOutMinBytes + pathData + '01' + '00';

      const pair = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
      const i = ethers.utils.hexZeroPad(ethers.BigNumber.from('2').toHexString(), 1).slice(2);
      const j = ethers.utils.hexZeroPad(ethers.BigNumber.from('1').toHexString(), 1).slice(2);
      const fromToken = USDT_ADDRESS;
      const toToken = USDC_ADDRESS.slice(2);

      const functionSelector = '3df02124';
      const curveBytesData =
        fromToken +
        amountInBytes +
        amountOutMinBytes +
        pair.slice(2) +
        toToken +
        functionSelector +
        i +
        j +
        '01' +
        '00';

      await universalRouter
        .connect(signer)
        .multiExecute([uniV3command, curveCommand], [uniV3BytesData, curveBytesData]);

      amountIn = amountIn * 2;
      amountOutMin = amountOutMin * 2;

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });

    it('Should split order USDT to USDC on UniV3 and USDT to USDC on Balancer', async function () {
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        signer,
        WETH_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        signer,
        token0Contract,
        token1Contract
      ));

      const uniV3command = '0x024000';
      const balancerCommad = '0x440000';

      amountIn = ethers.BigNumber.from('10000000000000000');
      amountOutMin = 1000000;

      const amountInBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(amountIn), 32).slice(2);
      const amountOutMinBytes = ethers.utils
        .hexZeroPad(ethers.utils.hexlify(amountOutMin), 32)
        .slice(2);

      const fee = 500;
      const encodedFee = ethers.utils.hexZeroPad(ethers.utils.hexlify(fee), 3).slice(2);
      const pathData = WETH_ADDRESS.slice(2) + encodedFee + USDC_ADDRESS.slice(2);

      // NOTE: Encoded data length is always same
      // amountIn (0-32), amountOutMin (32-64), encodedData(64 - x) + swapLength (2 bytes) + recipient bool (2 bytes);
      const uniV3BytesData = '0x' + amountInBytes + amountOutMinBytes + pathData + '01' + '00';

      const poolId = '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019';

      const singleSwap = [poolId, 0, WETH_ADDRESS, USDC_ADDRESS, amountIn, '0x'];
      const funds = [universalRouter.address, false, swapAccount, false];

      const balancerBytesData = iface.encodeFunctionData('swap', [
        singleSwap,
        funds,
        amountOutMin,
        deadline,
      ]);

      await universalRouter
        .connect(signer)
        .multiExecute([uniV3command, balancerCommad], [uniV3BytesData, balancerBytesData]);

      amountIn = amountIn.mul(2);
      amountOutMin = amountOutMin * 2;

      await checkBalanceChange(
        signer,
        amountIn.toString(),
        amountOutMin.toString(),
        txCost,
        approveTxCost,
        token0Balance,
        token1Balance,
        token0Contract,
        token1Contract,
        null
      );
    });
  });

  describe('Withdraw from contract', function () {
    it('Should withdraw WETH', async function () {
      const adminSigner = await getNewSigner(multiSigAccount);
      ({ token0Contract, token1Contract } = await createERC20Contracts(
        adminSigner,
        WETH_ADDRESS,
        USDC_ADDRESS
      ));
      ({ token0Balance, token1Balance } = await getBalances(
        adminSigner,
        token0Contract,
        token1Contract
      ));
      const erc20Array = [WETH_ADDRESS, USDC_ADDRESS];

      await universalRouter
        .connect(adminSigner)
        .withdrawERC20(erc20Array, multiSigAccount, { gasLimit: 1000000 });
      expect((await token0Contract.balanceOf(universalRouter.address)).toString()).to.equal('0');
      expect(Number(await token0Contract.balanceOf(multiSigAccount))).to.be.gt(
        Number(token0Balance)
      );
      expect((await token1Contract.balanceOf(universalRouter.address)).toString()).to.equal('0');
      expect(Number(await token1Contract.balanceOf(multiSigAccount))).to.be.gt(
        Number(token1Balance)
      );
    });

    it('Should withdraw ETH', async function () {
      const adminSigner = await getNewSigner(multiSigAccount);
      ({ token0Contract, token1Contract } = await createERC20Contracts(adminSigner, 0, 0));
      ({ token0Balance, token1Balance } = await getBalances(adminSigner, 0, 0));
      const tx = await universalRouter
        .connect(adminSigner)
        .withdrawETH(multiSigAccount, { gasLimit: 1000000 });
      const { txCost } = await getTxCost(tx);
      const balanceMinusCost = Number(token0Balance) - Number(txCost);
      expect((await hre.ethers.provider.getBalance(universalRouter.address)).toString()).to.equal(
        '0'
      );
      expect(Number(await hre.ethers.provider.getBalance(multiSigAccount))).to.be.gt(
        balanceMinusCost
      );
    });
  });
});
