#!/usr/bin/env ts-node
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying Spender as ${deployer.address}...`);

  const spender = await ethers.deployContract('Spender');

  await spender.waitForDeployment();

  console.log(`Deployed Spender to ${spender.target}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
