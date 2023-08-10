import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

// Ethereum mainnet as of block 17853419
const usdtTokenAddr = '0xdac17f958d2ee523a2206206994597c13d831ec7';

// Holds USDC as well
const usdtWhaleAddr = '0x0162Cd2BA40E23378Bf0FD41f919E1be075f025F';

describe('Spender', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Spender = await ethers.getContractFactory('Spender');
    const spender = await Spender.deploy();

    return { spender, owner, otherAccount };
  }

  describe('Deployment', function () {
    it('should deploy', async function () {
      await loadFixture(deployFixture);
    });
  });

  describe('transferFrom', function () {
    it('should not allow before approving', async function () {
      const { spender, owner } = await loadFixture(deployFixture);

      await expect(
        spender.transferFrom(usdtTokenAddr, usdtWhaleAddr, owner.address, 100)
      ).to.be.revertedWith(/missing role/);
    });

    it('should allow after approving', async function () {
      const { spender, owner } = await loadFixture(deployFixture);

      const amount = 100e6;

      // Assign role TRANSFER_ROLE to owner in spender
      await spender.grantRole(ethers.keccak256(ethers.toUtf8Bytes('TRANSFER_ROLE')), owner.address);

      const usdt = await ethers.getContractAt('IERC20', usdtTokenAddr);

      // Approve spender to move 100 USDT from exampleMainnetUsdtHolder
      await usdt
        .connect(await ethers.getImpersonatedSigner(usdtWhaleAddr))
        .approve(await spender.getAddress(), amount);

      await expect(
        spender.transferFrom(usdtTokenAddr, usdtWhaleAddr, owner.address, amount)
      ).to.changeTokenBalances(usdt, [owner, usdtWhaleAddr], [amount, -amount]);
    });
  });
});
