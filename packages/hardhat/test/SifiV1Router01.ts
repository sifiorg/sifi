import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

// Ethereum mainnet as of block 17853419
const usdtTokenAddr = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const usdcTokenAddr = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const wethTokenAddr = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const uniswapV2Router02Addr = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
const eeeAddr = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
// TODO: Replace
const feesAddr = '0x0C4BEf84b07dc0D84ebC414b24cF7Acce24261BA';

// Holds USDC as well
const usdtWhaleAddr = '0x0162Cd2BA40E23378Bf0FD41f919E1be075f025F';

describe('SifiV1Router01', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Spender = await ethers.getContractFactory('Spender');
    const spender = await Spender.deploy();

    const SifiV1Router01 = await ethers.getContractFactory('SifiV1Router01');

    const uniswapv2Router02 = new ethers.Contract(
      uniswapV2Router02Addr,
      new ethers.Interface([
        'function getAmountsOut(uint amountIn, address[] memory path) internal view returns (uint[] memory amounts)',
      ]),
      owner
    );

    const router = await SifiV1Router01.deploy(
      spender,
      feesAddr,
      wethTokenAddr,
      uniswapV2Router02Addr
    );

    // Assign role TRANSFER_ROLE to router in spender
    await spender.grantRole(
      ethers.keccak256(ethers.toUtf8Bytes('TRANSFER_ROLE')),
      await router.getAddress()
    );

    const deadline = await ethers.provider
      .getBlock('latest')
      .then(block => block!.timestamp + 1000);

    const usdt = await ethers.getContractAt('IERC20', usdtTokenAddr);

    // Fund owner with 100K USDT from a whale
    await usdt
      .connect(await ethers.getImpersonatedSigner(usdtWhaleAddr))
      .transfer(owner.address, BigInt(100000e6));

    const usdc = await ethers.getContractAt('IERC20', usdcTokenAddr);

    return { spender, router, owner, otherAccount, deadline, usdt, usdc, uniswapv2Router02 };
  }

  describe('Deployment', function () {
    it('should deploy', async function () {
      await loadFixture(deployFixture);
    });
  });

  describe('uniswapV2SwapExactETHForTokens', function () {
    it('should swap ETH for USDT', async function () {
      const { router, owner, deadline, usdt } = await loadFixture(deployFixture);

      // The user is quoted 1835 USDT for ETH but is delivered only
      // 1832.726821 USDT due to slippage. This is 12 bps of slippage,
      // which is within the 50 bps slippage limit.
      await expect(
        router.uniswapV2SwapExactETHForTokens(
          BigInt(1835e6),
          [eeeAddr, usdtTokenAddr],
          owner.address,
          // Max slippage (bps)
          50,
          // Dealdine as unix timestamp
          deadline,
          {
            value: BigInt(1e18),
          }
        )
      )
        .to.changeEtherBalance(owner, BigInt(-1e18))
        .and.changeTokenBalance(usdt, owner, 1832726821n);
    });

    it('should swap ETH for USDT with positive slippage', async function () {
      const { router, owner, deadline, usdt } = await loadFixture(deployFixture);

      // The user is quoted 1830 USDT for ETH but Uniswap delivers
      // 1832.726821 USDT due to positive slippage. The excess 2.726821
      // is sent to the fees address.
      await expect(
        router.uniswapV2SwapExactETHForTokens(
          BigInt(1830e6),
          [eeeAddr, usdtTokenAddr],
          owner.address,
          // Slippage tolerance (bps)
          50,
          // Dealdine as unix timestamp
          deadline,
          {
            value: BigInt(1e18),
          }
        )
      )
        .to.changeEtherBalance(owner, BigInt(-1e18))
        .and.changeTokenBalance(usdt, owner, BigInt(1830_000000n))
        .and.changeTokenBalance(usdt, feesAddr, 2_726821n);
    });
  });

  describe('uniswapV2SwapExactTokensForETH', function () {
    it('should swap USDT for ETH', async function () {
      const { router, owner, deadline, spender, usdt } = await loadFixture(deployFixture);

      // Approve spender to spend owner's USDT
      await usdt.approve(await spender.getAddress(), BigInt(2000e6));

      await expect(
        router.uniswapV2SwapExactTokensForETH(
          BigInt(2000e6), // USDT
          BigInt(1.09e18), // Quoted 1.09
          [usdtTokenAddr, eeeAddr],
          owner.address,
          50,
          deadline
        )
      )
        .to.changeTokenBalance(usdt, owner, -1850e6)
        .and.to.changeEtherBalance(owner, 1084602160117265487n);
    });

    it('should swap USDT for ETH with positive slippage', async function () {
      const { router, owner, deadline, spender, usdt } = await loadFixture(deployFixture);

      // Approve spender to spend owner's USDT
      await usdt.approve(await spender.getAddress(), BigInt(2000e6));

      await expect(
        router.uniswapV2SwapExactTokensForETH(
          BigInt(2000e6), // USDT
          BigInt(1.08e18), // Quoted 1.08
          [usdtTokenAddr, eeeAddr],
          owner.address,
          50,
          deadline
        )
      )
        .to.changeTokenBalance(usdt, owner, -1850e6)
        .and.to.changeEtherBalance(owner, BigInt(1.08e18))
        .and.to.changeEtherBalance(feesAddr, 4602160117265487n);
    });
  });

  describe('uniswapV2SwapExactTokensForTokens', function () {
    it('should swap USDT for USDC', async function () {
      const { router, owner, deadline, spender, usdt, usdc, uniswapv2Router02 } = await loadFixture(
        deployFixture
      );

      const [, amountOutQuoted] = await uniswapv2Router02.getAmountsOut(BigInt(2000e6), [
        usdtTokenAddr,
        usdcTokenAddr,
      ]);

      // Approve spender to spend owner's USDT
      await usdt.approve(await spender.getAddress(), BigInt(2000e6));

      await expect(
        router.uniswapV2SwapExactTokensForTokens(
          BigInt(2000e6), // 2,000 USDT
          amountOutQuoted,
          [usdtTokenAddr, usdcTokenAddr],
          owner.address,
          50,
          deadline
        )
      )
        .changeTokenBalance(usdt, owner, BigInt(-2000e6))
        .and.to.changeTokenBalance(usdc, owner, amountOutQuoted);
    });

    it('should swap USDT for USDC with positive slippage', async function () {
      const { router, owner, deadline, spender, usdt, usdc, uniswapv2Router02 } = await loadFixture(
        deployFixture
      );

      const [, amountOutQuoted] = await uniswapv2Router02.getAmountsOut(BigInt(2000e6), [
        usdtTokenAddr,
        usdcTokenAddr,
      ]);

      // Approve spender to spend owner's USDT
      await usdt.approve(await spender.getAddress(), BigInt(2000e6));

      await expect(
        router.uniswapV2SwapExactTokensForTokens(
          BigInt(2000e6), // 2,000 USDT
          amountOutQuoted - BigInt(10e6), // Accept 10 USDC less than quoted
          [usdtTokenAddr, usdcTokenAddr],
          owner.address,
          50,
          deadline
        )
      )
        .changeTokenBalance(usdt, owner, BigInt(-2000e6))
        .and.to.changeTokenBalance(usdc, owner, amountOutQuoted - BigInt(10e6))
        .and.to.changeTokenBalance(usdc, feesAddr, BigInt(10e6));
    });
  });
});
