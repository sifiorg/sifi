task('deploy-spender', 'Deploy Spender').setAction(async taskArgs => {
  const [deployer] = await ethers.getSigners();

  // TODO: Verify the args

  console.log(`Deploying Spender as ${deployer.address}...`);

  const spender = await ethers.deployContract('Spender');

  await router.waitForDeployment();

  console.log(`Deployed Spender to ${router.target}`);
});
